export const plugin = {
  name: "Image Upload Form",
  version: "1.0.0",
  description: "Provides a form to either upload an image or enter a URL, then adds the image to the assets/images folder upon post publishing.",

  init(context) {
    this.context = context;
    const { octokit, config } = context.getOctokit();
    this.selectedImage = null; // Store the selected image URL or uploaded image path

    // Function to convert file to base64 (required for GitHub content upload API)
    const toBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });

    // Function to check if file exists in the assets/images folder
    const checkIfFileExists = async (path) => {
      try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: config.owner,
          repo: config.repo,
          path: path,
        });

        if(data?.status === "404"){
          return false
        }
        return data.name; // File exists, return data
      } catch (error) {
        return null; // File doesn't exist
      }
    };

    // Function to upload image to assets/images and handle duplicate file names
    const uploadImage = async (file) => {
      let fileName = file.name;
      let uploadPath = `assets/images/${fileName}`;

      // Check if file already exists, if it does, try appending a number to the filename
      const fileExists = await checkIfFileExists(uploadPath);
      if (fileExists) {
        // Generate a new file name with a number appended to the base name
        let counter = 1;
        const baseName = fileName.replace(/\.[^/.]+$/, "");
        const extension = fileName.split('.').pop();
        uploadPath = `assets/images/${baseName} (${counter}).${extension}`;

        // Increment the counter and check again until a unique filename is found
        const nextFileExists = await checkIfFileExists(uploadPath);
        if (!nextFileExists) {
          // If the file with the new name doesn't exist, proceed with uploading
          return await uploadImage(file, uploadPath);
        }
      }

      // Upload the image after ensuring the file name is unique
      try {
        const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: config.owner,
          repo: config.repo,
          path: uploadPath,
          message: `Upload image: ${fileName}`,
          content: await toBase64(file)
        });

        // Return the URL to access the uploaded image
        return response.data.content.download_url;
      } catch (error) {
        console.error('Error uploading image:', error);
        context.showAlert('Error uploading image. Please try again.', 'error');
        return null;
      }
    };

    // Handle image URL or upload selection
    const handleImageInput = async () => {
      const imageInput = document.getElementById('image-url-or-upload');
      const selectedOption = imageInput.value;

      if (selectedOption === 'url') {
        const imageUrl = document.getElementById('image-url').value;
        if (imageUrl) {
          this.selectedImage = imageUrl;
        }
      } else if (selectedOption === 'upload') {
        const fileInput = document.getElementById('image-upload');
        const file = fileInput.files[0];

        if (file) {
          this.selectedImage = await uploadImage(file);
        }
      }

      if (this.selectedImage) {
        context.showAlert(`Image selected: ${this.selectedImage}`, 'success');
      }
    };

    // Create the image upload form
    const createImageForm = () => {
      const imageFormSection = document.createElement('div');
      imageFormSection.id = 'image-form-section';
      imageFormSection.className = 'space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg';

      imageFormSection.innerHTML = `
        <div class="flex justify-between items-center">
          <h3 class="font-semibold text-blue-900">📷 Image Upload or URL</h3>
        </div>
        <div class="space-y-4">
          <label for="image-url-or-upload" class="block text-sm font-medium text-gray-700 mb-1">Choose Upload Type</label>
          <select id="image-url-or-upload" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">-- Select Option --</option>
            <option value="url">Image URL</option>
            <option value="upload">Upload Image</option>
          </select>

          <div id="url-input-section" class="space-y-4 hidden">
            <label for="image-url" class="block text-sm font-medium text-gray-700 mb-1">Enter Image URL</label>
            <input type="url" id="image-url" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="https://example.com/image.jpg">
          </div>

          <div id="upload-input-section" class="space-y-4 hidden">
            <label for="image-upload" class="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
            <input type="file" id="image-upload" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
          </div>
        </div>
      `;

      // Insert the form into the editor (below the tags field)
      const tagsField = context.elements.tags.parentElement.parentElement;
      tagsField.parentNode.insertBefore(imageFormSection, tagsField.nextSibling);

      // Show the appropriate input section based on the selected option
      document.getElementById('image-url-or-upload').addEventListener('change', (event) => {
        const selectedOption = event.target.value;
        this.selectedImage = selectedOption;

        // Toggle the visibility of the URL input or the upload input
        document.getElementById('url-input-section').classList.toggle('hidden', selectedOption !== 'url');
        document.getElementById('upload-input-section').classList.toggle('hidden', selectedOption !== 'upload');
      });
    };

    // Initialize or refresh the image form
    createImageForm();

    // Add the image plugin to update the front matter with the image path (always update with either URL or path)
    const imagePlugin = (frontMatter, existingFrontMatter) => {
      let imagePath;

      // If an image URL was provided or uploaded, use it
      if (this.selectedImage) {
        // If it's an uploaded image, it will have a path like /assets/images/imagename
        if (!this.selectedImage.startsWith('http')) {
          imagePath = `/assets/images/${this.selectedImage.split('/').pop()}`;
        } else {
          // If it's a URL, use the URL directly
          imagePath = this.selectedImage;
        }
      } else {
        // If no image URL or file is provided, set a default image (optional)
        imagePath = null;  // Use a default image if needed
      }

      // Add the image field to the front matter
      frontMatter += `image: "${imagePath}"\n`;
      return frontMatter;
    };

    // Add the image plugin to the front matter plugins array
    context.frontMatterPlugins.push(imagePlugin);

    // Listen for the post published event
    context.on('postSubmit', async () => {
      console.log("called")
      console.log(this.selectedImage)
      // Update front matter to include the image path if an image was selected (uploaded or URL)
      if (this.selectedImage) {
        await handleImageInput();
        context.showAlert(`Image "${this.selectedImage}" added to the post.`, 'success');
      }
    });
  }
};

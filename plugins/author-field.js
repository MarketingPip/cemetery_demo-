export const plugin = {
  name: "Author Selector",
  version: "1.0.0",
  description: "Fetches author names from the '_authors' folder to populate author selection dropdown.",
  
  init(context) {
    // Get Octokit instance
    const { octokit, config } = context.getOctokit();
    this.context = context;
    this.selectedAuthor = null;  // Store the selected author

    // Function to fetch authors from the _authors folder
    const getAuthors = async () => {
      const authors = [];
      try {
        // Fetch contents of the _authors folder
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: config.owner,         // GitHub repository owner
          repo: config.repo,           // GitHub repository name
          path: '_authors',            // Path to the '_authors' folder
        });

        // Extract filenames (assuming each file represents an author)
        data.forEach(file => {
          const authorName = file.name.replace(/\.[^/.]+$/, "");  // Remove file extension
          authors.push(authorName);
        });
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
      return authors;
    };

    // Author Plugin to inject selected author into front matter
    const authorPlugin = (frontMatter, existingFrontMatter) => {
      const author = this.selectedAuthor || existingFrontMatter.author || 'Unknown Author';
      frontMatter.author = author
      return frontMatter;
    };

    // Create the custom author field form
    const createAuthorField = async () => {
      // Fetch authors and generate the dropdown
      const authors = await getAuthors();

      // Select the section where the form will be inserted
      const authorFieldSection = document.createElement('div');
      authorFieldSection.id = 'author-field-section';
      authorFieldSection.className = 'space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg';
      authorFieldSection.innerHTML = `
        <div class="flex justify-between items-center">
          <h3 class="font-semibold text-blue-900">👤 Select Author</h3>
        </div>
        <div class="space-y-4">
          <label for="author-select" class="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <select id="author-select" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">-- Select Author --</option>
            ${authors.map(author => `<option value="${author}">${author}</option>`).join('')}
          </select>
        </div>
      `;

      // Insert the form into the editor (below the tags field)
      const tagsField = context.elements.tags.parentElement.parentElement;
      tagsField.parentNode.insertBefore(authorFieldSection, tagsField.nextSibling);

      // Update the selected author whenever the user makes a selection
      const authorSelect = document.getElementById('author-select');
      authorSelect.addEventListener('change', () => {
        const selectedAuthor = authorSelect.value;
        this.selectedAuthor = selectedAuthor;  // Update the selected author
        if (selectedAuthor) {
          context.showAlert(`Author selected: ${selectedAuthor}`, 'success');
        }
      });
    };

    // Refetch authors when the user navigates back to the author tab
    const refreshAuthorField = async () => {
      // Clear the existing dropdown (if it exists)
      const authorFieldSection = document.getElementById('author-field-section');
      if (authorFieldSection) {
        authorFieldSection.remove();  // Remove the old author field section
      }

      // Create the author field again with updated authors
      await createAuthorField();
    };

    // Initialize or refresh the author field when the plugin is loaded
    createAuthorField();

    // Listen for any event or trigger to refresh the author field
    //  listen for an event or hook here to know when the user returns to the author tab
    context.on('tab-switch', (tabName) => {
      if (tabName === 'create') {
        refreshAuthorField();  // Refresh the author list when navigating back to the author tab
      }
    });

    // Add the author plugin to the front matter plugins array
    context.frontMatterPlugins.push(authorPlugin);

        // Listen for the post published event
    context.on('postSubmit', async () => {
      // Update front matter to include the image path if an image was selected (uploaded or URL)
      if (!this.selectedAuthor) {
        throw new Error(`Author selected is required`);
      }
    });
    
    // Show an alert that the plugin has been loaded
    context.showAlert('Author Selector loaded! Choose an author from the dropdown.', 'success');
  }
};

export const plugin = {
  name: "Live Preview & File Manager",
  rendered:false,
  async init(context) {
    this.context = context;

    // Adding the "File Manager" tab
    context.addTab('file-manager', '📂 File Manager',
      '<div id="file-manager-container" class="p-4"><p>Loading...</p></div>',
      async (ctx) => {
        const { octokit, config } = context.getOctokit();
        const owner = config.owner;
        const repo = config.repo;

        this.currentRepo = repo;
        this.currentOwner = owner;
        let currentFolderPath = ''; // Always initialize with an empty string
        // Fetch all files and folders in a given path
       const getFiles = async (path = '') => {
  try {
    const { octokit, config } = context.getOctokit();
    const owner = config.owner;
    const repo = config.repo;

    const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      headers: {
        'If-None-Match': ''  // Disable ETag caching by setting If-None-Match to an empty string
      }
    });

    return data;
  } catch (error) {
    console.error('Error fetching repository contents:', error);
    return [];
  }
};

        // Render the file manager UI
    const renderFileManager = async (path = '') => {
  currentFolderPath = path; // Update current path whenever we render
  const files = await getFiles(path);
  const fileManagerContainer = document.getElementById('file-manager-container');
  
  // Force reflow to ensure the DOM is properly updated
  fileManagerContainer.offsetHeight; // This forces a reflow

  fileManagerContainer.innerHTML = ''; // Clear previous content

  const fileListContainer = document.createElement('div');
  fileListContainer.className = 'space-y-4';

  if (files.length === 0) {
    fileManagerContainer.innerHTML = '<p>No files or folders found in this directory.</p>';
    return;
  }

  // "Go Up" Button to navigate to the parent folder
  if (path) {
    const goUpButton = document.createElement('button');
    goUpButton.className = 'bg-blue-600 text-white px-4 py-2 rounded-md mb-4';
    goUpButton.innerHTML = '⬆️ Go Up';
    goUpButton.addEventListener('click', () => {
      const parentPath = path.split('/').slice(0, -1).join('/');
      renderFileManager(parentPath); // Go up to the parent folder
    });
    fileListContainer.appendChild(goUpButton);
  }

  const fileList = document.createElement('ul');
  fileList.className = 'file-list space-y-2';

  files.forEach(file => {
    const fileItem = document.createElement('li');
    fileItem.className = 'file-item flex justify-between items-center p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors';

    const isFolder = file.type === 'dir';
    const fileName = file.name;

    // Folder item: Render clickable folder
    if (isFolder) {
      fileItem.innerHTML = `
        <span class="file-name font-semibold">${fileName}/</span>
        <button class="view-file-btn bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-sm" data-path="${file.path}">View Folder</button>
        <button class="delete-file-btn bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-sm" data-path="${file.path}">🗑️ Delete</button>
      `;
    } else {
      // File item: Render clickable file
      fileItem.innerHTML = `
        <span class="file-name">${fileName}</span>
        <button class="view-file-btn bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-sm" data-path="${file.path}">View</button>
        <button class="delete-file-btn bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-sm" data-path="${file.path}">🗑️ Delete</button>
      `;
    }

    // Handle file preview
    fileItem.querySelector('.view-file-btn').addEventListener('click', async (e) => {
      const path = e.target.getAttribute('data-path');

      // If it's a folder, render its contents and change the current folder
      if (isFolder) {
        currentFolderPath = path; // Update current path
        renderFileManager(path); // Recurse into the folder
      } else {
        await this.context.viewFile(path)
      }
    });

    // Handle file/folder deletion
    fileItem.querySelector('.delete-file-btn').addEventListener('click', async (e) => {
      const path = e.target.getAttribute('data-path');
      const confirmDelete = confirm(`Are you sure you want to delete "${fileName}"?`);
      if (confirmDelete) {
        await deleteFileOrFolder(path);
      }
    });

    fileList.appendChild(fileItem);
  });

  fileListContainer.appendChild(fileList);
  fileManagerContainer.appendChild(fileListContainer);

  // Force reflow again after rendering (useful for desktop layouts)
  fileManagerContainer.offsetHeight; // Another force reflow

  this.owner = owner;
  this.repo = repo;
  this.rendered = true;    
      
};

// Delete file or folder from GitHub
const deleteFileOrFolder = async (path) => {
  const { octokit, config } = context.getOctokit();
  const owner = config.owner;
  const repo = config.repo;

  try {
    // Fetch the file/folder metadata to get the SHA
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      headers: {
        'If-None-Match': ''  // Disable ETag caching by setting If-None-Match to an empty string
      }
    });

    const sha = data.sha; // SHA of the file to delete

    // If it's a directory (folder), first delete all files inside it
    if (data.type === 'dir') {
      const files = await getFiles(path); // Get all files inside the folder
      for (let file of files) {
        await deleteFileOrFolder(file.path); // Recursively delete files in the folder
      }
    }

    // Now delete the file or folder (with the correct SHA)
    const deleteResponse = await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      message: `Delete file or folder: ${path}`,
      sha, // Pass the SHA for deletion
      headers: {
        'If-None-Match': ''  // Disable ETag caching by setting If-None-Match to an empty string
      }
    });

    console.log(`Deleted: ${path}`);
    alert(`"${path}" has been deleted successfully.`);

    // After deletion, refresh the file manager for the current folder
    await renderFileManager(currentFolderPath); // Wait for render to finish

  } catch (error) {
    console.error('Error deleting file or folder:', error);
    alert(`Failed to delete "${path}".`);
  }
};


        // Get file content from GitHub
        const getFileContent = async (path) => {
          try {
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
              owner: config.owner,
              repo: config.repo,
              path,
            });

            if (data.encoding === 'base64') {
              const decodedContent = atob(data.content);
              return decodedContent;
            }

            this.context.currentEditPost = { path };
            return data.content; // Return content directly if not encoded
          } catch (error) {
            console.error('Error fetching file content:', error);
            return null;
          }
        };

        // Show file content in preview area
        const showFilePreview = async (content) => {
          if (!content) {
            document.getElementById('preview-area').innerHTML = `
              <p><strong>Unable to load content.</strong></p>
            `;
            return;
          }

          const { marked } = await import('https://esm.sh/marked');
          const htmlContent = marked(content);
          this.currentContent = htmlContent;
        };

        // Load the file manager UI initially for the root directory
        if(!this.rendered){
        console.log("false")
        await renderFileManager(); // Wait for the initial render
        }
      }
    );
  }
};

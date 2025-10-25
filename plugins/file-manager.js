export const plugin = {
  name: "Live Preview & File Manager",
  async init(context) {
    this.context = context;

    // Adding the "Preview" tab
    context.addTab('preview', '👁️ Preview',
      '<div id="preview-area" class="prose"></div>',
      async (ctx) => {
        const currentEditPost = this.context.currentEditPost;
        const content = ctx.getFormData().content;

        if (currentEditPost && currentEditPost.path) {
          const fileExtension = currentEditPost.path.split('.').pop().toLowerCase();

          if (fileExtension === 'md' || !fileExtension) {
            // Dynamically import the markdown parser
            const { marked } = await import('https://esm.sh/marked');
            const htmlContent = marked(content);
            document.getElementById('preview-area').innerHTML = htmlContent;
          } else {
            document.getElementById('preview-area').innerHTML = `
              <p><strong>Preview unavailable:</strong> The file type is not supported for live preview.</p>
            `;
          }
        } else {
          if (content) {
            const { marked } = await import('https://esm.sh/marked');
            const htmlContent = marked(content);
            document.getElementById('preview-area').innerHTML = htmlContent;
          } else {
            document.getElementById('preview-area').innerHTML = `
              <p><strong>No content available for preview.</strong></p>
            `;
          }
        }
      }
    );

    // Adding the "File Manager" tab
    context.addTab('file-manager', '📂 File Manager',
      '<div id="file-manager-container"><p>Loading...</p></div>',
      async (ctx) => {
        const { octokit, config } = context.getOctokit();
        const owner = config.owner;
        const repo = config.repo;

        let currentFolderPath = ''; // Tracks the current folder path being viewed

        // Fetch all files and folders in a given path
        const getFiles = async (path = '') => {
          try {
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
              owner,
              repo,
              path,
            });
            return data;
          } catch (error) {
            console.error('Error fetching repository contents:', error);
            return [];
          }
        };

        // Render the file manager UI
        const renderFileManager = async (path = '') => {
          const files = await getFiles(path);
          const fileManagerContainer = document.getElementById('file-manager-container');
          fileManagerContainer.innerHTML = ''; // Clear previous content

          if (files.length === 0) {
            fileManagerContainer.innerHTML = '<p>No files or folders found in this directory.</p>';
            return;
          }

          const fileList = document.createElement('ul');
          fileList.className = 'file-list';

          files.forEach(file => {
            const fileItem = document.createElement('li');
            fileItem.className = 'file-item';
            const isFolder = file.type === 'dir';
            const fileName = file.name;
            
            // Folder item: Render clickable folder
            if (isFolder) {
              fileItem.innerHTML = `
                <span class="file-name">${fileName}/</span>
                <button class="view-file-btn" data-path="${file.path}">View Folder</button>
              `;
            } else {
              // File item: Render clickable file
              fileItem.innerHTML = `
                <span class="file-name">${fileName}</span>
                <button class="view-file-btn" data-path="${file.path}">View</button>
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
                const fileContent = await getFileContent(path);
                await showFilePreview(fileContent);
              }
            });

            fileList.appendChild(fileItem);
          });

          fileManagerContainer.appendChild(fileList);
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
              // Decode content if it's base64 encoded
              const decodedContent = atob(data.content);
              return decodedContent;
            }

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

          // Dynamically import the markdown parser (if content is markdown)
          const { marked } = await import('https://esm.sh/marked');
          const htmlContent = marked(content);

          // Update preview area
          document.getElementById('preview-area').innerHTML = htmlContent;
        };

        // Load the file manager UI initially for the root directory
        renderFileManager();
      }
    );
  }
};

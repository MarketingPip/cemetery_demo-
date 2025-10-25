export const plugin = {
  name: "Live Preview & File Manager",
  async init(context) {
    this.context = context;
    // Adding the "File Manager" tab
    context.addTab('file-manager', '📂 File Manager', 
      '<div id="file-manager-container"><p>Loading...</p></div>',
      async (ctx) => {
        const { octokit, config } = context.getOctokit();
        const owner = config.owner;
        const repo = config.repo;

        // Fetch all files in the repository
        const getFiles = async () => {
          try {
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents', {
              owner,
              repo,
            });
            return data;
          } catch (error) {
            console.error('Error fetching repository files:', error);
            return [];
          }
        };

        // Render file manager UI
        const renderFileManager = async () => {
          const files = await getFiles();
          const fileManagerContainer = document.getElementById('file-manager-container');
          fileManagerContainer.innerHTML = '';

          if (files.length === 0) {
            fileManagerContainer.innerHTML = '<p>No files found in the repository.</p>';
            return;
          }

          const fileList = document.createElement('ul');
          fileList.className = 'file-list';

          files.forEach(file => {
            const fileItem = document.createElement('li');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
              <span class="file-name">${file.name}</span>
              <button class="view-file-btn" data-path="${file.path}">View</button>
            `;

            // Handle file preview
            fileItem.querySelector('.view-file-btn').addEventListener('click', async (e) => {
              const path = e.target.getAttribute('data-path');
              const fileContent = await getFileContent(path);
              showFilePreview(fileContent);
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
        const showFilePreview = (content) => {
          if (!content) {
            document.getElementById('preview-area').innerHTML = `
              <p><strong>Unable to load content.</strong></p>
            `;
            return;
          }

          // Dynamically import the markdown parser (if content is markdown)
          const { marked } = import('https://esm.sh/marked');
          const htmlContent = marked(content);

          // Update preview area
          document.getElementById('preview-area').innerHTML = htmlContent;
        };

        // Load the file manager UI
        renderFileManager();
      }
    );
  }
};

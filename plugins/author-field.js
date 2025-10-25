export const plugin = {
  name: "Author Selector",
  version: "1.0.0",
  description: "Fetches author names from the '_authors' folder to populate author selection dropdown.",
  
  init(context) {
    // Get Octokit instance
    const { octokit, config } = context.getOctokit();

    this.context = context
   
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
          // You can customize this based on your file naming convention
          const authorName = file.name.replace(/\.[^/.]+$/, "");  // Remove file extension (e.g., `.md`, `.txt`)
          authors.push(authorName);
        });
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
      return authors;
    };



      const authorPlugin = (frontMatter, existingFrontMatter) => {
  const author = this.selectedAuthor || existingFrontMatter.author || 'Unknown Author';
  frontMatter += `author: "${author}"\n`;
  return frontMatter;
};
    
    // Create the custom author field form
    const createAuthorField = async () => {
      const authors = await getAuthors();

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



      
      // Insert the form into the editor
      const tagsField = context.elements.tags.parentElement.parentElement;
      tagsField.parentNode.insertBefore(authorFieldSection, tagsField.nextSibling);
      
      // Handle author selection
      const authorSelect = document.getElementById('author-select');
      authorSelect.addEventListener('change', () => {
        const selectedAuthor = authorSelect.value;
        this.selectedAuthor = selectedAuthor;

        
        if (selectedAuthor) {
          context.showAlert(`Author selected: ${selectedAuthor}`, 'success');
        }
      });
    };

    // Initialize the form when plugin is loaded
    createAuthorField();

    context.frontMatterPlugins.push(authorPlugin);
    
    context.showAlert('Author Selector loaded! Choose an author from the dropdown.', 'success');
  }
};

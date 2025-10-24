// author-manager.js - Plugin for managing Jekyll author files
export const plugin = {
  name: "Author Manager",
  version: "1.0.0",
  description: "Manage author files in _authors folder with full CRUD operations",
  
  init(context) {
    let currentEditAuthor = null;
    let authors = [];

    // Create the Authors tab
    const tab = context.addTab(
      'authors',
      '👥 Authors',
      `
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold text-gray-800">👥 Author Management</h2>
            <div class="flex gap-2">
              <button id="new-author-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200">
                ➕ New Author
              </button>
              <button id="refresh-authors-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-200">
                🔄 Refresh
              </button>
            </div>
          </div>

          <!-- Author Form -->
          <div id="author-form" class="hidden glass-effect rounded-xl shadow-lg p-6 animate-slide-in">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold text-gray-800">
                <span id="form-mode-icon">➕</span>
                <span id="form-mode-text">New Author</span>
              </h3>
              <button id="cancel-author-btn" class="text-gray-600 hover:text-gray-800 font-medium">
                ✕ Cancel
              </button>
            </div>
            
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" id="author-name" placeholder="John Doe" 
                         class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Author Slug *</label>
                  <input type="text" id="author-slug" placeholder="john-doe" 
                         class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <p class="text-xs text-gray-500 mt-1">Used in URLs (lowercase, hyphens only)</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role/Title</label>
                <input type="text" id="author-role" placeholder="Historical Preservation Specialist" 
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea id="author-bio" rows="4" placeholder="Write a brief biography..." 
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"></textarea>
              </div>

              <div class="border-t pt-4">
                <h4 class="font-semibold text-gray-700 mb-3">Social Media Links</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      <span class="inline-block w-20">Facebook</span>
                    </label>
                    <input type="url" id="author-facebook" placeholder="https://facebook.com/username" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      <span class="inline-block w-20">Twitter</span>
                    </label>
                    <input type="url" id="author-twitter" placeholder="https://twitter.com/username" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      <span class="inline-block w-20">LinkedIn</span>
                    </label>
                    <input type="url" id="author-linkedin" placeholder="https://linkedin.com/in/username" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      <span class="inline-block w-20">GitHub</span>
                    </label>
                    <input type="url" id="author-github" placeholder="https://github.com/username" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      <span class="inline-block w-20">Website</span>
                    </label>
                    <input type="url" id="author-website" placeholder="https://example.com" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      <span class="inline-block w-20">Email</span>
                    </label>
                    <input type="email" id="author-email" placeholder="author@example.com" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  </div>
                </div>
              </div>

              <div class="flex gap-3 pt-4">
                <button id="save-author-btn" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200">
                  💾 Save Author
                </button>
                <button id="clear-author-btn" class="px-6 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition duration-200">
                  🗑️ Clear
                </button>
              </div>
            </div>
          </div>

          <!-- Authors List -->
          <div id="authors-list-container">
            <div id="loading-authors" class="hidden text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p class="mt-4 text-gray-600">Loading authors...</p>
            </div>

            <div id="authors-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Authors will be loaded here -->
            </div>

            <div id="no-authors" class="hidden text-center py-12 text-gray-500">
              <p class="text-lg">No authors found.</p>
              <p class="text-sm mt-2">Click "New Author" to create your first author profile!</p>
            </div>
          </div>
        </div>
      `,
      (ctx) => {
        // Load authors when tab is activated
        loadAuthors(context);
      }
    );

    // Helper: Get form elements
    function getFormElements() {
      return {
        name: document.getElementById('author-name'),
        slug: document.getElementById('author-slug'),
        role: document.getElementById('author-role'),
        bio: document.getElementById('author-bio'),
        facebook: document.getElementById('author-facebook'),
        twitter: document.getElementById('author-twitter'),
        linkedin: document.getElementById('author-linkedin'),
        github: document.getElementById('author-github'),
        website: document.getElementById('author-website'),
        email: document.getElementById('author-email')
      };
    }

    // Helper: Generate author front matter
    function generateAuthorFrontMatter(data) {
      let frontMatter = '---\n';
      frontMatter += `layout: author\n`;
      frontMatter += `name: ${data.name}\n`;
      frontMatter += `author: ${data.slug}\n`;
      
      if (data.role) {
        frontMatter += `role: ${data.role}\n`;
      }
      
      if (data.bio) {
        frontMatter += `bio: >-\n`;
        // Format bio with proper indentation
        const bioLines = data.bio.split('\n');
        bioLines.forEach(line => {
          frontMatter += `  ${line.trim()}\n`;
        });
      }
      
      // Add social media links
      const social = {};
      if (data.facebook) social.facebook = data.facebook;
      if (data.twitter) social.twitter = data.twitter;
      if (data.linkedin) social.linkedin = data.linkedin;
      if (data.github) social.github = data.github;
      if (data.website) social.website = data.website;
      if (data.email) social.email = data.email;
      
      if (Object.keys(social).length > 0) {
        frontMatter += `social:\n`;
        Object.entries(social).forEach(([key, value]) => {
          frontMatter += `  ${key}: '${value}'\n`;
        });
      }
      
      frontMatter += '---\n';
      return frontMatter;
    }

    // Helper: Parse author front matter
    function parseAuthorFrontMatter(content) {
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (!match) return null;

      const frontMatterText = match[1];
      const data = {
        name: '',
        slug: '',
        role: '',
        bio: '',
        social: {}
      };

      let currentKey = null;
      let bioLines = [];
      let inBio = false;
      let inSocial = false;

      frontMatterText.split('\n').forEach(line => {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('bio:')) {
          inBio = true;
          inSocial = false;
          return;
        }
        
        if (trimmed.startsWith('social:')) {
          inSocial = true;
          inBio = false;
          return;
        }
        
        if (inBio && line.startsWith('  ')) {
          bioLines.push(line.trim());
          return;
        } else if (inBio) {
          inBio = false;
        }
        
        if (inSocial && line.startsWith('  ')) {
          const colonIndex = line.indexOf(':');
          if (colonIndex > -1) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            value = value.replace(/^['"]|['"]$/g, '');
            data.social[key] = value;
          }
          return;
        }
        
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > -1) {
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();
          
          if (key === 'name') data.name = value;
          else if (key === 'author') data.slug = value;
          else if (key === 'role') data.role = value;
        }
      });

      if (bioLines.length > 0) {
        data.bio = bioLines.join('\n');
      }

      return data;
    }

    // Load authors from repository
    async function loadAuthors(pluginContext) {
      const loadingEl = document.getElementById('loading-authors');
      const listEl = document.getElementById('authors-list');
      const noAuthorsEl = document.getElementById('no-authors');
      
      loadingEl.classList.remove('hidden');
      listEl.classList.add('hidden');
      noAuthorsEl.classList.add('hidden');

      try {

        const octokit = pluginContext.getOctokit

        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: config.owner,
          repo: config.repo,
          path: '_authors'
        });

        authors = data.filter(file => file.name.endsWith('.md') || file.name.endsWith('.markdown'));

        if (authors.length === 0) {
          noAuthorsEl.classList.remove('hidden');
        } else {
          displayAuthors(authors);
          listEl.classList.remove('hidden');
        }
      } catch (error) {
        if (error.status === 404) {
          noAuthorsEl.classList.remove('hidden');
          context.showAlert('_authors folder not found. It will be created when you add your first author.', 'info');
        } else {
          context.showAlert('Error loading authors: ' + error.message, 'error');
        }
      } finally {
        loadingEl.classList.add('hidden');
      }
    }

    // Display authors in grid
    function displayAuthors(authorsList) {
      const listEl = document.getElementById('authors-list');
      
      listEl.innerHTML = authorsList.map(author => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <h3 class="font-semibold text-lg text-gray-800">${formatAuthorName(author.name)}</h3>
              <p class="text-sm text-gray-500">${author.name}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="edit-author flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition duration-200 text-sm" 
                    data-path="${author.path}" data-sha="${author.sha}">
              ✏️ Edit
            </button>
            <button class="delete-author flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition duration-200 text-sm" 
                    data-path="${author.path}" data-sha="${author.sha}" data-name="${author.name}">
              🗑️ Delete
            </button>
          </div>
        </div>
      `).join('');

      // Attach event listeners
      document.querySelectorAll('.edit-author').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const path = e.currentTarget.dataset.path;
          const sha = e.currentTarget.dataset.sha;
          await editAuthor(path, sha, pluginContext);
        });
      });

      document.querySelectorAll('.delete-author').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const path = e.currentTarget.dataset.path;
          const sha = e.currentTarget.dataset.sha;
          const name = e.currentTarget.dataset.name;
          await deleteAuthor(path, sha, name, pluginContext);
        });
      });
    }

    // Format author name from filename
    function formatAuthorName(filename) {
      return filename
        .replace(/\.(md|markdown)$/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    // Show author form
    function showAuthorForm(editMode = false) {
      const formEl = document.getElementById('author-form');
      const formIcon = document.getElementById('form-mode-icon');
      const formText = document.getElementById('form-mode-text');
      
      formEl.classList.remove('hidden');
      formIcon.textContent = editMode ? '✏️' : '➕';
      formText.textContent = editMode ? 'Edit Author' : 'New Author';
      
      // Scroll to form
      formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Hide author form
    function hideAuthorForm() {
      document.getElementById('author-form').classList.add('hidden');
      clearAuthorForm();
      currentEditAuthor = null;
    }

    // Clear author form
    function clearAuthorForm() {
      const els = getFormElements();
      Object.values(els).forEach(el => el.value = '');
    }

    // Edit author
    async function editAuthor(path, sha, pluginContext) {
      try {
        const octokit = pluginContext.getOctokit

        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner: config.owner,
          repo: config.repo,
          path
        });

        const content = decodeURIComponent(escape(atob(data.content)));
        const authorData = parseAuthorFrontMatter(content);

        if (authorData) {
          const els = getFormElements();
          els.name.value = authorData.name || '';
          els.slug.value = authorData.slug || '';
          els.role.value = authorData.role || '';
          els.bio.value = authorData.bio || '';
          els.facebook.value = authorData.social.facebook || '';
          els.twitter.value = authorData.social.twitter || '';
          els.linkedin.value = authorData.social.linkedin || '';
          els.github.value = authorData.social.github || '';
          els.website.value = authorData.social.website || '';
          els.email.value = authorData.social.email || '';

          currentEditAuthor = { path, sha };
          showAuthorForm(true);
          context.showAlert('Author loaded for editing', 'info');
        }
      } catch (error) {
        context.showAlert('Error loading author: ' + error.message, 'error');
      }
    }

    // Delete author
    async function deleteAuthor(path, sha, name, pluginContext) {
      if (!confirm(`Are you sure you want to delete author "${formatAuthorName(name)}"?`)) {
        return;
      }

      try {
        const octokit = pluginContext.getOctokit;

        await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
          owner: config.owner,
          repo: config.repo,
          path,
          message: `Delete author: ${name}`,
          sha
        });

        context.showAlert('Author deleted successfully', 'success');
        await loadAuthors(pluginContext);
      } catch (error) {
        context.showAlert('Error deleting author: ' + error.message, 'error');
      }
    }

    // Save author
    async function saveAuthor(pluginContext) {
      const els = getFormElements();
      const name = els.name.value.trim();
      const slug = els.slug.value.trim();

      if (!name || !slug) {
        context.showAlert('Name and slug are required', 'error');
        return;
      }

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(slug)) {
        context.showAlert('Slug must contain only lowercase letters, numbers, and hyphens', 'error');
        return;
      }

      const authorData = {
        name,
        slug,
        role: els.role.value.trim(),
        bio: els.bio.value.trim(),
        facebook: els.facebook.value.trim(),
        twitter: els.twitter.value.trim(),
        linkedin: els.linkedin.value.trim(),
        github: els.github.value.trim(),
        website: els.website.value.trim(),
        email: els.email.value.trim()
      };

      const content = generateAuthorFrontMatter(authorData);
      const filename = `${slug}.md`;
      const path = `_authors/${filename}`;

      try {
        const octokit = pluginContext.getOctokit

        let sha = currentEditAuthor?.sha;

        // Check if file exists (for new authors)
        if (!currentEditAuthor) {
          try {
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
              owner: config.owner,
              repo: config.repo,
              path
            });
            sha = data.sha;
          } catch (err) {
            if (err.status !== 404) throw err;
          }
        }

        // Save author file
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: config.owner,
          repo: config.repo,
          path: currentEditAuthor ? currentEditAuthor.path : path,
          message: currentEditAuthor ? `Update author: ${name}` : `Add author: ${name}`,
          content: btoa(unescape(encodeURIComponent(content))),
          sha
        });

        const action = currentEditAuthor ? 'updated' : 'created';
        context.showAlert(`Author ${action} successfully!`, 'success');
        
        hideAuthorForm();
        await loadAuthors(pluginContext);
      } catch (error) {
        context.showAlert('Error saving author: ' + error.message, 'error');
      }
    }

    // Auto-generate slug from name
    setTimeout(() => {
      const nameInput = document.getElementById('author-name');
      const slugInput = document.getElementById('author-slug');
      
      if (nameInput && slugInput) {
        nameInput.addEventListener('input', () => {
          if (!currentEditAuthor && !slugInput.value) {
            const slug = nameInput.value
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            slugInput.value = slug;
          }
        });
      }

      // Event listeners
      document.getElementById('new-author-btn')?.addEventListener('click', () => {
        currentEditAuthor = null;
        clearAuthorForm();
        showAuthorForm(false);
      });

      // Add event listener with argument
document.getElementById('refresh-authors-btn')?.addEventListener('click', (event) => {
  // Pass an additional argument (e.g., 'admin') to the loadAuthors function
  loadAuthors(pluginContext);
});

document.getElementById('save-author-btn')?.addEventListener('click', (event) => {
  // Pass an additional argument (e.g., 'admin') to the loadAuthors function
  saveAuthor(pluginContext);
});      

      document.getElementById('cancel-author-btn')?.addEventListener('click', hideAuthorForm);
      document.getElementById('clear-author-btn')?.addEventListener('click', clearAuthorForm);
    }, 500);

    context.showAlert('Author Manager plugin loaded! Go to the Authors tab to manage author profiles.', 'success');
  },

  action: {
    label: "👥 Manage Authors",
    handler(context) {
      context.switchTab('authors');
    }
  }
};

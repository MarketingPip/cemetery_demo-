export const plugin = {
  name: "Jekyll _config Manager",
  version: "1.0.0",
  description: "Manage and update Jekyll _configuration directly from the plugin.",
  
  async init(context) {
    let __config = {};
    let sha = '';  // Add a variable to store the SHA of the _config file

    this.context = context;
    // Tab to show Jekyll _config settings
    const tab = context.addTab(
      'jekyll-_config',
      '⚙️ Jekyll _config',
      `
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold text-gray-800">⚙️ Jekyll _configuration</h2>
            <div class="flex gap-2">
              <button id="refresh-_config-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-200">
                🔄 Refresh _config
              </button>
            </div>
          </div>

          <!-- _config List -->
          <div id="_config-list-container">
            <div id="loading-_config" class="hidden text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p class="mt-4 text-gray-600">Loading _configuration...</p>
            </div>

            <div id="_config-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- _config settings will be loaded here -->
            </div>

            <div id="no-_config" class="hidden text-center py-12 text-gray-500">
              <p class="text-lg">No _configuration found.</p>
            </div>
          </div>
        </div>
      `,
      (ctx) => {
        load_config(this.context); // Trigger the load when the tab is initialized
      }
    );

    // Helper: Load Jekyll _config
    async function load_config(pluginContext) {
      console.log(pluginContext);
      const loadingEl = document.getElementById('loading-_config');
      const listEl = document.getElementById('_config-list');
      const no_configEl = document.getElementById('no-_config');
      
      loadingEl.classList.remove('hidden');
      listEl.classList.add('hidden');
      no_configEl.classList.add('hidden');

      try {
        const { octokit, config } = pluginContext.getOctokit();
        
        // Fetch the Jekyll _config (e.g., _config.yml or other YAML file)
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/_config.yml', {
          owner: config.owner,
          repo: config.repo
        });

        const decoded_config = atob(data.content); // Decode base64 content
        sha = data.sha; // Store the SHA of the file for later use in the update

        // Dynamically import `js-yaml` via ESM CDN
        const yaml = await import('https://cdn.esm.sh/js-yaml@4.1.0/dist/js-yaml.js');

        // Parse YAML content asynchronously
        __config = yaml.load(decoded_config);

        if (!__config) {
          no_configEl.classList.remove('hidden');
        } else {
          display_config(_config, pluginContext);
          listEl.classList.remove('hidden');
        }
      } catch (error) {
        context.showAlert('Error loading _config: ' + error.message, 'error');
      } finally {
        loadingEl.classList.add('hidden');
      }
    }

    // Display _config settings
    function display_config(_configData, pluginContext) {
      const listEl = document.getElementById('_config-list');
      
      listEl.innerHTML = Object.keys(_configData).map(key => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <h3 class="font-semibold text-lg text-gray-800">${key}</h3>
              <p class="text-sm text-gray-500">Current Value: ${_configData[key]}</p>
            </div>
            <button class="edit-_config bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm" 
                    data-_config-key="${key}" data-_config-value="${_configData[key]}">
              ✏️ Edit
            </button>
          </div>

          <!-- Optional Inputs Form -->
          <div class="_config-inputs-form hidden" id="inputs-form-${key}">
            <div class="space-y-2">
              ${generateInputsForm(key, _configData[key])}
              <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200" 
                      data-_config-key="${key}">
                Submit & Update
              </button>
            </div>
          </div>
        </div>
      `).join('');  // Join the inner HTML for the _config list

      // Attach event listeners to "Edit" buttons
      document.querySelectorAll('.edit-_config').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const _configKey = e.currentTarget.dataset._configKey;
          const form = document.getElementById(`inputs-form-${_configKey}`);
          form.classList.toggle('hidden'); // Toggle inputs form visibility
        });
      });

      // Attach event listener to submit the updated _config
      document.querySelectorAll('._config-inputs-form button').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const _configKey = e.currentTarget.dataset._configKey;
          const updatedValue = collectInput(_configKey);
          await update_config(_configKey, updatedValue, pluginContext);
        });
      });
    }

    // Generate the input field for a _config setting
    function generateInputsForm(_configKey, currentValue) {
      return `
        <div class="flex items-center space-x-2">
          <label for="${_configKey}" class="text-sm font-medium text-gray-600">Update ${_configKey}</label>
          <input type="text" id="${_configKey}" name="${_configKey}" class="border border-gray-300 p-2 rounded-md w-full" 
                 value="${currentValue}" placeholder="Enter new value">
        </div>
      `;
    }

    // Collect the updated input value
    function collectInput(_configKey) {
      const input = document.getElementById(_configKey);
      return input.value;
    }

    // Update the Jekyll _config with the new value
    async function update_config(_configKey, updatedValue, pluginContext) {
      try {
        const { octokit, config } = pluginContext.getOctokit();

        // Update the Jekyll _config file (e.g., _config.yml)
        const new_configContent = { ..._config, [_configKey]: updatedValue };

        console.log(new_configContent)
        // Dynamically import `js-yaml` for stringifying the YAML content
        const yaml = await import('https://cdn.esm.sh/js-yaml@4.1.0/dist/js-yaml.js');
        const encoded_config = btoa(yaml.dump(new_configContent)); // Encode to base64

        // Use the SHA value we fetched earlier to ensure we're updating the correct file
        await octokit.request('PUT /repos/{owner}/{repo}/contents/_config.yml', {
          owner: config.owner,
          repo: config.repo,
          path: '_config.yml',
          message: `Update _config setting: ${_configKey}`,
          content: encoded_config,
          sha: sha  // Provide the SHA for the file
        });

        context.showAlert('_config updated successfully!', 'success');
      } catch (error) {
        context.showAlert('Error updating _config: ' + error.message, 'error');
      }
    }

    // Refresh _config
    document.getElementById('refresh-_config-btn')?.addEventListener('click', (event) => {
      load_config(this.context);
    });

    context.showAlert('Jekyll _config Manager plugin loaded! Go to the _config tab to manage and update your Jekyll settings.', 'success');
  },

  action: {
    label: "⚙️ Manage Jekyll _config",
    handler(context) {
      context.switchTab('jekyll-_config');
    }
  }
};

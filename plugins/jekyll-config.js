export const plugin = {
  name: "Jekyll Config Manager",
  version: "1.0.0",
  description: "Manage and update Jekyll configuration directly from the plugin.",
  
  async init(context) {
    let config = {};

    this.context = context;
    // Tab to show Jekyll config settings
    const tab = context.addTab(
      'jekyll-config',
      '⚙️ Jekyll Config',
      `
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold text-gray-800">⚙️ Jekyll Configuration</h2>
            <div class="flex gap-2">
              <button id="refresh-config-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-200">
                🔄 Refresh Config
              </button>
            </div>
          </div>

          <!-- Config List -->
          <div id="config-list-container">
            <div id="loading-config" class="hidden text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p class="mt-4 text-gray-600">Loading configuration...</p>
            </div>

            <div id="config-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Config settings will be loaded here -->
            </div>

            <div id="no-config" class="hidden text-center py-12 text-gray-500">
              <p class="text-lg">No configuration found.</p>
            </div>
          </div>
        </div>
      `,
      (ctx) => {
        loadConfig(this.context); // Trigger the load when the tab is initialized
      }
    );

    // Helper: Load Jekyll config
    async function loadConfig(pluginContext) {
      const loadingEl = document.getElementById('loading-config');
      const listEl = document.getElementById('config-list');
      const noConfigEl = document.getElementById('no-config');
      
      loadingEl.classList.remove('hidden');
      listEl.classList.add('hidden');
      noConfigEl.classList.add('hidden');

      try {
        const { octokit, config } = pluginContext.getOctokit();
        
        // Fetch the Jekyll config (e.g., _config.yml or other YAML file)
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/_config.yml', {
          owner: config.owner,
          repo: config.repo
        });

        const decodedConfig = atob(data.content); // Decode base64 content
        
        // Dynamically import `js-yaml` via ESM CDN
        const yaml = await import('https://cdn.esm.sh/js-yaml@4.1.0/dist/js-yaml.js');

        // Parse YAML content asynchronously
        config = yaml.load(decodedConfig);

        if (!config) {
          noConfigEl.classList.remove('hidden');
        } else {
          displayConfig(config, pluginContext);
          listEl.classList.remove('hidden');
        }
      } catch (error) {
        context.showAlert('Error loading config: ' + error.message, 'error');
      } finally {
        loadingEl.classList.add('hidden');
      }
    }

    // Display config settings
    function displayConfig(configData, pluginContext) {
      const listEl = document.getElementById('config-list');
      
      listEl.innerHTML = Object.keys(configData).map(key => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <h3 class="font-semibold text-lg text-gray-800">${key}</h3>
              <p class="text-sm text-gray-500">Current Value: ${configData[key]}</p>
            </div>
            <button class="edit-config bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm" 
                    data-config-key="${key}" data-config-value="${configData[key]}">
              ✏️ Edit
            </button>
          </div>

          <!-- Optional Inputs Form -->
          <div class="config-inputs-form hidden" id="inputs-form-${key}">
            <div class="space-y-2">
              ${generateInputsForm(key, configData[key])}
              <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200" 
                      data-config-key="${key}">
                Submit & Update
              </button>
            </div>
          </div>
        </div>
      `).join('');

      // Attach event listeners to "Edit" buttons
      document.querySelectorAll('.edit-config').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const configKey = e.currentTarget.dataset.configKey;
          const form = document.getElementById(`inputs-form-${configKey}`);
          form.classList.toggle('hidden'); // Toggle inputs form visibility
        });
      });

      // Attach event listener to submit the updated config
      document.querySelectorAll('.config-inputs-form button').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const configKey = e.currentTarget.dataset.configKey;
          const updatedValue = collectInput(configKey);
          await updateConfig(configKey, updatedValue, pluginContext);
        });
      });
    }

    // Generate the input field for a config setting
    function generateInputsForm(configKey, currentValue) {
      return `
        <div class="flex items-center space-x-2">
          <label for="${configKey}" class="text-sm font-medium text-gray-600">Update ${configKey}</label>
          <input type="text" id="${configKey}" name="${configKey}" class="border border-gray-300 p-2 rounded-md w-full" 
                 value="${currentValue}" placeholder="Enter new value">
        </div>
      `;
    }

    // Collect the updated input value
    function collectInput(configKey) {
      const input = document.getElementById(configKey);
      return input.value;
    }

    // Update the Jekyll config with the new value
    async function updateConfig(configKey, updatedValue, pluginContext) {
      try {
        const { octokit, config } = pluginContext.getOctokit();

        // Update the Jekyll config file (e.g., _config.yml)
        const newConfigContent = { ...config, [configKey]: updatedValue };

        // Dynamically import `js-yaml` for stringifying the YAML content
        const yaml = await import('https://cdn.esm.sh/js-yaml@4.1.0/dist/js-yaml.js');
        const encodedConfig = btoa(yaml.dump(newConfigContent)); // Encode to base64

        await octokit.request('PUT /repos/{owner}/{repo}/contents/_config.yml', {
          owner: config.owner,
          repo: config.repo,
          path: '_config.yml',
          message: `Update config setting: ${configKey}`,
          content: encodedConfig,
        });

        context.showAlert('Config updated successfully!', 'success');
      } catch (error) {
        context.showAlert('Error updating config: ' + error.message, 'error');
      }
    }

    // Refresh config
    document.getElementById('refresh-config-btn')?.addEventListener('click', (event) => {
      loadConfig(this.octokit);
    });

    context.showAlert('Jekyll Config Manager plugin loaded! Go to the Config tab to manage and update your Jekyll settings.', 'success');
  },

  action: {
    label: "⚙️ Manage Jekyll Config",
    handler(context) {
      context.switchTab('jekyll-config');
    }
  }
};

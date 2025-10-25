export const plugin = {
  name: "GitHub Workflow Manager",
  version: "1.0.0",
  description: "List and run GitHub workflows directly from the plugin.",
  
  init(context) {
    let workflows = [];
    this.context = context
    // Tab to show workflows
    const tab = context.addTab(
      'workflows',
      '⚙️ Workflows',
      `
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold text-gray-800">⚙️ GitHub Workflows</h2>
            <div class="flex gap-2">
              <button id="refresh-workflows-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-200">
                🔄 Refresh Workflows
              </button>
            </div>
          </div>

          <!-- Workflows List -->
          <div id="workflows-list-container">
            <div id="loading-workflows" class="hidden text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p class="mt-4 text-gray-600">Loading workflows...</p>
            </div>

            <div id="workflows-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Workflows will be loaded here -->
            </div>

            <div id="no-workflows" class="hidden text-center py-12 text-gray-500">
              <p class="text-lg">No workflows found in this repository.</p>
            </div>
          </div>
        </div>
      `,
      (ctx) => {
        loadWorkflows(this.context);
      }
    );

    // Helper: Load workflows from GitHub repository
    async function loadWorkflows(pluginContext) {
      const loadingEl = document.getElementById('loading-workflows');
      const listEl = document.getElementById('workflows-list');
      const noWorkflowsEl = document.getElementById('no-workflows');
      
      loadingEl.classList.remove('hidden');
      listEl.classList.add('hidden');
      noWorkflowsEl.classList.add('hidden');

      try {
        const { octokit, config } = pluginContext.getOctokit();
        
        // Fetch workflows from the repository
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/workflows', {
          owner: config.owner,
          repo: config.repo
        });

        workflows = data.workflows;

        if (workflows.length === 0) {
          noWorkflowsEl.classList.remove('hidden');
        } else {
          displayWorkflows(workflows, pluginContext);
          listEl.classList.remove('hidden');
        }
      } catch (error) {
        context.showAlert('Error loading workflows: ' + error.message, 'error');
      } finally {
        loadingEl.classList.add('hidden');
      }
    }

    // Display workflows in grid
    function displayWorkflows(workflowsList, pluginContext) {
      const listEl = document.getElementById('workflows-list');
      
      listEl.innerHTML = workflowsList.map(workflow => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <h3 class="font-semibold text-lg text-gray-800">${workflow.name}</h3>
              <p class="text-sm text-gray-500">ID: ${workflow.id}</p>
            </div>
            <button class="run-workflow bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm" 
                    data-workflow-id="${workflow.id}" data-workflow-name="${workflow.name}">
              🚀 Run
            </button>
          </div>

          <!-- Optional Inputs Form -->
          <div class="workflow-inputs-form hidden" id="inputs-form-${workflow.id}">
            <div class="space-y-2">
              ${generateInputsForm(workflow)}
              <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200" 
                      data-workflow-id="${workflow.id}">
                Submit Inputs & Run
              </button>
            </div>
          </div>
        </div>
      `).join('');

      // Attach event listeners to "Run" buttons
      document.querySelectorAll('.run-workflow').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const workflowId = e.currentTarget.dataset.workflowId;
          const form = document.getElementById(`inputs-form-${workflowId}`);
          form.classList.toggle('hidden'); // Toggle inputs form visibility
        });
      });

      // Attach event listener to submit the workflow with inputs
      document.querySelectorAll('.workflow-inputs-form button').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const workflowId = e.currentTarget.dataset.workflowId;
          const inputs = collectInputs(workflowId);
          await runWorkflow(workflowId, inputs, pluginContext);
        });
      });
    }

    // Generate the input fields for a workflow
    function generateInputsForm(workflow) {
      if (!workflow.workflow_dispatch || !workflow.workflow_dispatch.inputs) {
        return ''; // No inputs defined for this workflow
      }

      return Object.keys(workflow.workflow_dispatch.inputs).map(inputName => {
        const input = workflow.workflow_dispatch.inputs[inputName];
        return `
          <div class="flex items-center space-x-2">
            <label for="${inputName}" class="text-sm font-medium text-gray-600">${input.description || inputName}</label>
            <input type="text" id="${inputName}" name="${inputName}" class="border border-gray-300 p-2 rounded-md w-full" 
                   placeholder="${input.required ? 'Required' : 'Optional'}">
          </div>
        `;
      }).join('');
    }

    // Collect inputs from the form
    function collectInputs(workflowId) {
      const form = document.getElementById(`inputs-form-${workflowId}`);
      const inputs = {};
      
      // Collect all inputs from the form
      form.querySelectorAll('input').forEach(input => {
        inputs[input.name] = input.value;
      });

      return inputs;
    }

    // Trigger a workflow with inputs
    async function runWorkflow(workflowId, inputs, pluginContext) {
      try {
        const { octokit, config } = pluginContext.getOctokit();

        // Trigger the workflow run with inputs
        await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
          owner: config.owner,
          repo: config.repo,
          workflow_id: workflowId,
          ref: 'main',  // or use the specific branch
          inputs: inputs,  // Pass inputs here
        });

        context.showAlert('Workflow triggered successfully!', 'success');
      } catch (error) {
        context.showAlert('Error triggering workflow: ' + error.message, 'error');
      }
    }

    // Refresh workflows
    document.getElementById('refresh-workflows-btn')?.addEventListener('click', (event) => {
      loadWorkflows(this.octokit);
    });

    context.showAlert('GitHub Workflow Manager plugin loaded! Go to the Workflows tab to manage and run workflows.', 'success');
  },

  action: {
    label: "⚙️ Manage Workflows",
    handler(context) {
      context.switchTab('workflows');
    }
  }
};

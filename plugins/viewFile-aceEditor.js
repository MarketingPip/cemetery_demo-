async function viewPlugin(pluginPath) {
  try {
    const textfile = isTextFile(pluginPath);
    const _isImage = isImage(pluginPath);

    if (!_isImage && !textfile) {
      throw new Error("File extension is not supported");
    }

    const { octokit, config } = getOctokit();

    let data;

    if (pluginPath.endsWith(".csv")) {
      const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/main/${pluginPath}`;
      const csvContentResponse = await fetch(rawUrl);
      const csvContent = await csvContentResponse.text();
      data = csvContent;
    } else {
      const _octokit = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: config.owner,
        repo: config.repo,
        path: pluginPath,
      });
      data = _octokit.data;
    }

    const viewer = document.createElement("div");
    viewer.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";

    if (_isImage) {
      const fileExtension = pluginPath.split(".").pop().toLowerCase();
      viewer.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden h-full">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-semibold">${pluginPath}</h3>
            <button class="close-viewer text-gray-600 hover:text-gray-800 text-2xl">&times;</button>
          </div>
          <div class="p-4 overflow-auto max-h-[calc(90vh-80px)] bg-gray-50">
            ${
              fileExtension === "svg"
                ? `<div class="svg-container" style="max-width: 100%; max-height: calc(90vh - 80px);">${atob(
                    data.content
                  )}</div>`
                : `<img src="data:image/${fileExtension};base64,${data.content}" alt="${pluginPath}" class="max-w-full max-h-[calc(90vh-80px)] object-contain" />`
            }
          </div>
        </div>
      `;
    } else {
      const content = pluginPath.endsWith(".csv") ? data : decodeURIComponent(escape(atob(data.content)));

      viewer.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden h-full">
          <div class="flex justify-between items-center p-4 border-b space-x-2">
            <h3 class="text-xl font-semibold">${pluginPath}</h3>
            <div class="ml-auto flex space-x-2">
              <button class="save-file-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm">💾 Save</button>
              <button class="close-viewer text-gray-600 hover:text-gray-800 text-2xl">&times;</button>
            </div>
          </div>
          <div id="ace-editor" class="flex-1 h-full w-full bg-gray-50"></div>
        </div>
      `;

      // Import Ace Editor dynamically
      const ace = (await import("https://esm.sh/ace-builds/src-noconflict/ace.js")).default;
      await import("https://esm.sh/ace-builds/src-noconflict/ext-language_tools.js");
      await import("https://esm.sh/ace-builds/src-noconflict/mode-javascript.js");
      await import("https://esm.sh/ace-builds/src-noconflict/mode-yaml.js");
      await import("https://esm.sh/ace-builds/src-noconflict/mode-json.js");
      await import("https://esm.sh/ace-builds/src-noconflict/theme-monokai.js");

      document.body.appendChild(viewer);

      const ext = pluginPath.split(".").pop().toLowerCase();
      const modeMap = {
        js: "ace/mode/javascript",
        json: "ace/mode/json",
        yml: "ace/mode/yaml",
        yaml: "ace/mode/yaml",
        csv: "ace/mode/plain_text",
        html: "ace/mode/html",
        css: "ace/mode/css",
        txt: "ace/mode/text",
        md: "ace/mode/markdown",
      };
      const mode = modeMap[ext] || "ace/mode/text";

      const editor = ace.edit("ace-editor");
      editor.setTheme("ace/theme/monokai");
      editor.session.setMode(mode);
      editor.setValue(content, -1);
      editor.setOptions({
        fontSize: "14px",
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        showPrintMargin: false,
      });

      window.currentAceEditor = editor;

      // Save file button handler
      const saveBtn = viewer.querySelector(".save-file-btn");
      saveBtn.addEventListener("click", async () => {
        const newContent = editor.getValue();
        try {
          await saveFile(pluginPath, newContent); // implement this function to push changes to GitHub or local
          showAlert(`Saved ${pluginPath}`, "success");
        } catch (err) {
          console.error("Error saving file:", err);
          showAlert(`Error saving file: ${err.message}`, "error");
        }
      });
    }

    // Viewer close handlers
    viewer.querySelector(".close-viewer").addEventListener("click", () => {
      document.body.removeChild(viewer);
    });
    viewer.addEventListener("click", (e) => {
      if (e.target === viewer) document.body.removeChild(viewer);
    });
  } catch (error) {
    console.error("Error viewing plugin:", error);
    showAlert("Error viewing plugin: " + error.message, "error");
  }
}

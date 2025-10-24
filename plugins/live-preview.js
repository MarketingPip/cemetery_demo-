export const plugin = {
  name: "Live Preview",
  init(context) {
    context.addTab('preview', '👁️ Preview', 
      '<div id="preview-area" class="prose"></div>',
      (ctx) => {
        // Update preview when tab opens
        const content = ctx.getFormData().content;
        document.getElementById('preview-area').textContent = content;
      }
    );
  }
};

export const plugin = {
  name: "Live Preview",
  async init(context) {
    this.context = context
    // Adding the "Preview" tab
    context.addTab('preview', '👁️ Preview', 
      '<div id="preview-area" class="prose"></div>',
      async (ctx) => {
        // Get the current post data
        const currentEditPost = this.context.currentEditPost;

        // Check if the post exists and has a valid path
        if (currentEditPost && currentEditPost.path) {
          const fileExtension = currentEditPost.path.split('.').pop().toLowerCase();

          if (fileExtension === 'md' || !fileExtension) {
            // If it's a Markdown file (.md) or no extension (new post), render the Markdown content
            const content = ctx.getFormData().content;

            // Dynamically import the markdown parser
            const { marked } = await import('https://esm.sh/marked');

            // Convert Markdown to HTML
            const htmlContent = marked(content);

            // Update the preview area with the rendered HTML
            document.getElementById('preview-area').innerHTML = htmlContent;
          } else {
            // If it's not a Markdown file, show a message
            document.getElementById('preview-area').innerHTML = `
              <p><strong>Preview unavailable:</strong> The file type is not supported for live preview.</p>
            `;
          }
        } else {
          // If there is no valid post or path, show a default message
          document.getElementById('preview-area').innerHTML = `
            <p><strong>No content available for preview.</strong></p>
          `;
        }
      }
    );
  }
};

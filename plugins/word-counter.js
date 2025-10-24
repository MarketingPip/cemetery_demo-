// Example: word-counter.js
export const plugin = {
  name: "Word Counter",
  version: "1.0.0",
  description: "Adds word count display to editor",
  
  init(context) {
    // Create word count display
    const counter = document.createElement('div');
    counter.id = 'word-counter';
    counter.className = 'text-sm text-gray-600 mt-2';
    counter.textContent = 'Words: 0';
    
    // Insert after content textarea
    const textarea = context.elements.content;
    textarea.parentNode.insertBefore(counter, textarea.nextSibling);
    
    // Update on input
    textarea.addEventListener('input', () => {
      const words = textarea.value.trim().split(/\s+/).length;
      counter.textContent = \`Words: \${words}\`;
    });
    
    context.showAlert('Word Counter plugin loaded!', 'success');
  },
  
  // Optional: Add custom action button
  action: {
    label: "📊 Count Words",
    handler(context) {
      const words = context.elements.content.value.trim().split(/\s+/).length;
      alert(\`Total words: \${words}\`);
    }
  }
};

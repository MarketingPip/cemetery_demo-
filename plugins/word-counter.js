export const plugin = {
  name: "Word Counter",
  version: "1.0.0",
  description: "Adds word count to editor",
  
  init(context) {
    // Your initialization code
    context.showAlert('Plugin loaded!', 'success');
  },
  
  action: {
    label: "📊 Count Words",
    handler(context) {
      const words = context.elements.content.value.trim().split(/\s+/).length;
      alert(`Total words: ${words}`);
    }
  }
};

export const plugins = [
  {
    name: "Plugin 1",
    init: (context) => { 
      context.showAlert('Plugin installed', 'success') 
    },
    action: {
      label: "Action 1",
      handler: () => { /* Action code */ }
    }
  },
  {
    name: "Plugin 2",
    init: (context) => { 
    context.showAlert('Plugin 2 installed', 'success')   
    }
  }
];

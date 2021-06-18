let _macroHelper;

Hooks.on("canvasReady", () => {  
  _macroHelper = new macroHelper();
  _macroHelper.build_helper();
});

// _macroHelpers.debugMessage('asdf asdf ');

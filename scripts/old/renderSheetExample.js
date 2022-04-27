  // call this with: game.settings.get("swademacros", "removebranding")
  game.settings.register('swademacros', 'removebranding', {
    name: 'Remove Actor Sheet Branding',
    hint: 'If you check this box the image branding will be removed from the actor sheet.',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });
  
  
  Hooks.on("renderActorSheet", (app, html) => {
  if (game.settings.get("swademacros", "removebranding")) {
  //html[0].querySelector(".branding img").style.display = "none";
    html[0].querySelector(".branding img").remove();
    html[0].querySelector(".branding img").remove();   
  }
});

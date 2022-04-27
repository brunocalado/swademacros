Hooks.once('init', function() {

  // call this with: game.settings.get("swademacros", "adventuredecktable")
  game.settings.register('swademacros', 'adventuredecktable', {
    name: 'Adventure Deck using Table',
    hint: 'Default name of the table where you want the macro Adventure Deck - Table to drawn.',
    scope: 'world',
    config: true,
    default: 'Adventure Deck',
    type: String
  });

  // call this with: game.settings.get("swademacros", "adventuredeckdeck")
  game.settings.register('swademacros', 'adventuredeckdeck', {
    name: 'Adventure Deck using a Deck',
    hint: 'Default name of the deck where you want the macro Adventure Deck - Deck to drawn.',
    scope: 'world',
    config: true,
    default: 'Adventure Deck',
    type: String
  });

  // call this with: game.settings.get("swademacros", "chasedecktable")
  game.settings.register('swademacros', 'chasedecktable', {
    name: 'Chase Deck',
    hint: 'Default name of the table where you want the macro Chase to drawn.',
    scope: 'world',
    config: true,
    default: 'Action Cards',
    type: String
  });

  // call this with: game.settings.get("swademacros", "removebranding")
  game.settings.register('swademacros', 'removebranding', {
    name: 'Remove Actor Sheet Branding',
    hint: 'If you check this box the image branding will be removed from the actor sheet.',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

});

Hooks.on("renderActorSheet", (app, html) => {
  if (game.settings.get("swademacros", "removebranding")) {
  //html[0].querySelector(".branding img").style.display = "none";
    html[0].querySelector(".branding img").remove();
    html[0].querySelector(".branding img").remove();   
  }
});

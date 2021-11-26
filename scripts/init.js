Hooks.once('init', function() {

  // call this with: game.settings.get("swademacros", "adventuredecktable")
  game.settings.register('swademacros', 'adventuredecktable', {
    name: 'Adventure-Deck',
    hint: 'Add the default name of the table where you want the macro Adventure Deck to drawn.',
    scope: 'world',
    config: true,
    default: 'Adventure Deck',
    type: String
  });

});

Hooks.once('init', function() {

  // call this with: game.settings.get("swademacros", "adventuredecktable")
  game.settings.register('swademacros', 'adventuredecktable', {
    name: 'Adventure Deck',
    hint: 'Default name of the table where you want the macro Adventure Deck to drawn.',
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

});

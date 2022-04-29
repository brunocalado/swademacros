const moduleName = 'swademacros';

Hooks.once('init', function() {

  // call this with: game.settings.get("swademacros", "adventuredecktable")
  game.settings.register(moduleName, 'adventuredecktable', {
    name: 'Adventure Deck using Table',
    hint: 'Default name of the table where you want the macro Adventure Deck - Table to drawn.',
    scope: 'world',
    config: true,
    default: 'Adventure Deck',
    type: String
  });

  // call this with: game.settings.get("swademacros", "adventuredeckdeck")
  game.settings.register(moduleName, 'adventuredeckdeck', {
    name: 'Adventure Deck using a Deck',
    hint: 'Default name of the deck where you want the macro Adventure Deck - Deck to drawn.',
    scope: 'world',
    config: true,
    default: 'Adventure Deck',
    type: String
  });

  // call this with: game.settings.get("swademacros", "chasedecktable")
  game.settings.register(moduleName, 'chasedecktable', {
    name: 'Chase Deck',
    hint: 'Default name of the table where you want the macro Chase to drawn.',
    scope: 'world',
    config: true,
    default: 'Action Cards',
    type: String
  });

  // --------------------------------------------------
  // Keybinding
  game.keybindings.register(moduleName, "cardsTip", {
    name: 'Action Cards Rank',
    hint: 'This will provide a quick tip about the Action Cards Rank. Useful for new players.',
    editable: [{ key: "KeyQ", modifiers: []}],
    onDown: () => {
      let chatData = {
        speaker: null,
        content: `
          <h2>Action Cards Rank</h2>
          <p style="color: red; font-weight: bold; font-size:22px; text-align: center;">♠ > ♥ > ♦ > ♣</p>
          <p style="color: red; font-weight: bold; font-size:20px; text-align: center;">A > K > Q > J > 10 >....2</p>
        `};
      ChatMessage.create(chatData, {});      
    },
    onUp: () => {},
    restricted: false,  // Restrict this Keybinding to gamemaster only?
    reservedModifiers: [],
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
  
});

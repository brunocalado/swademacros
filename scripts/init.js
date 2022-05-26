const moduleName = 'swademacros';
import {sm} from './api.js'

Hooks.once('init', function() {
  // --------------------------------------------------
  // Load API
  game.modules.get(moduleName).api = { sm }; // Request with: const sm = game.modules.get('swademacros')?.api.sm;

  // --------------------------------------------------
  // Module Options
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

  // call this with: game.settings.get("swademacros", "interludedeck")
  game.settings.register(moduleName, 'interludedeck', {
    name: 'Interlude Deck',
    hint: 'Default name of the deck used by the interlude macro.',
    scope: 'world',
    config: true,
    default: 'Action Deck',
    type: String
  });

  // call this with: game.settings.get("swademacros", "feartablepath")
  game.settings.register(moduleName, 'feartablepath', {
    name: 'Fear Table',
    hint: 'If you have the oficial modules type SWADE or SWPF. If you want to use your table, type the name of a table in your world.',
    scope: 'world',
    config: true,
    default: 'SWADE',
    type: String
  });

  // call this with: game.settings.get("swademacros", "creativecombattablepath")
  game.settings.register(moduleName, 'creativecombattablepath', {
    name: 'Creative Combat Table',
    hint: 'If you have the oficial modules type SWADE or SWPF. If you want to use your table, type the name of a table in your world.',
    scope: 'world',
    config: true,
    default: 'SWADE',
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

Hooks.on(`ready`, () => {
  function is_first_active_gm() {
    let is_first_gm = game.users.find(u => u.isGM && u.active);   // Returns the ID of the first active GM
    return (game.user.id === is_first_gm?.id);  //Returns true if it is the first active GM, False if not.
  }
  // Warpgate Watches
  const sm = game.modules.get('swademacros')?.api.sm;
  warpgate.event.watch("shapeChangeTrigger", sm.shapeChangeGM, is_first_active_gm); // 
});

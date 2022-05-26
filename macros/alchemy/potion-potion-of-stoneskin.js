const version = 'v0.4';
const sm = game.modules.get('swademacros')?.api.sm;
const itemName = 'Potion of Stoneskin';
const icon = 'icons/consumables/potions/bottle-round-corked-yellow.webp';

const myActiveEffect = {
  changes: [{"key":"data.stats.toughness.value", "mode":CONST.ACTIVE_EFFECT_MODES.ADD, "value":"4"}],
  icon: icon,
  label: itemName
}  

/* 
source: 
icon: 
*/
let tokenD=canvas.tokens.controlled[0];
const myTitle = `Potion`;
  
if (tokenD===undefined) {
  ui.notifications.error("Please select a token."); // No Token is Selected
} else {
  main();
} 

// Modified from a macro by spacemandev
async function main() {
  let myItem = await sm.getItem(tokenD, itemName);
  if(undefined == myItem) {
    return; 
  }
  
  // Active Effect On?
  const temp = sm.getActiveEffect(tokenD, itemName);
  if( temp != undefined ) {
    sm.styledChatMessageSimple(itemName, `You already used it.`, icon);       
    return;
  }

  // Subtract item
  await sm.useItem(tokenD, itemName);
  
  // Item does stuff
  sm.addActiveEffectToOwnedToken(tokenD, myActiveEffect); 

  // message
  sm.styledChatMessageSimple(itemName, `${tokenD.actor.name} used a ${itemName}.`, icon);
}
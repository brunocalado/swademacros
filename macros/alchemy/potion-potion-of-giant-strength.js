const itemName = 'Potion of Giant Strength';

const myActiveEffect = {
  changes: [{"key":"data.attributes.strength.die.sides", "mode":CONST.ACTIVE_EFFECT_MODES.ADD, "value":"4"}],
  icon: 'icons/consumables/potions/bottle-round-corked-blue.webp',
  label: itemName
}  

/* 
source: 
icon: 
*/
const version = 'v0.1';
let tokenD=canvas.tokens.controlled[0];
const myTitle = `Potion`;
let message1 = ``;
let message2 = itemName;
  
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
    console.log(sm.getActiveEffect(tokenD, itemName));
    sm.styledChatMessage(itemName, '', `You already used it.`)       
    return;
  }

  // Subtract item
  await sm.useItem(tokenD, itemName);
  
  // Item does stuff
  sm.addActiveEffect(tokenD, myActiveEffect); 

  // message
  sm.styledChatMessage(itemName, '', `${tokenD.actor.name} used a ${itemName}.`);
}
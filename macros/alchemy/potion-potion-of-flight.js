const version = 'v0.3';
const itemName = 'Potion of Flight';

const myActiveEffect = {
  changes: [
    {"key":"data.stats.speed.value", "mode":CONST.ACTIVE_EFFECT_MODES.OVERRIDE, "value":"12"}
  ],
  icon: 'icons/consumables/potions/potion-jar-corked-green.webp',
  label: itemName
}  

/* 
source: 
icon: 
*/
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
    sm.styledChatMessageSimple(itemName, `You already used it.`)       
    return;
  }

  // Subtract item
  await sm.useItem(tokenD, itemName);
  
  // Item does stuff
  sm.addActiveEffect(tokenD, myActiveEffect, false); 

  // message
  sm.styledChatMessageSimple( itemName, `${tokenD.actor.name} used a ${itemName}.` );
}
const itemName = 'Potion of Healing';

/* 
source: 
icon: 
*/
const version = 'v0.4';
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
  
  //If token is max health if so, don't do anything
  if( sm.getWounds(tokenD) == 0 ) {
    sm.styledChatMessageSimple(itemName, `You are not injured.`)       
    return;
  }

  //Subtract item
  await sm.useItem(tokenD, itemName);
  
  // remove 1 current wound
  sm.applyWounds(tokenD, -1);

  sm.styledChatMessageSimple(itemName, `${tokenD.actor.name} used a ${itemName} and cured 1 wound.`);
}
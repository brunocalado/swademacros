const itemName = 'Potion of Strong Invigoration';

/* 
source: 
icon: 
*/
const version = 'v0.5';
const sm = game.modules.get('swademacros')?.api.sm;
let tokenD=canvas.tokens.controlled[0];
  
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
  if( sm.getFatigue(tokenD) == 0 ) {
    sm.styledChatMessageSimple(itemName, `You are not fatigued.`);       
    return;
  }

  //Subtract item
  await sm.useItem(tokenD, itemName);
  
  // remove 1 
  sm.applyFatigue(tokenD, -2);

  sm.styledChatMessageSimple(itemName, `${tokenD.actor.name} used a ${itemName} and removed 2 level of fatigue.`);
}
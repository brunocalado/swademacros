const itemName = 'Potion of Invigoration';

/* 
source: 
icon: 
*/
const version = 'v0.2';
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
  
  //If token is max health if so, don't do anything
  if( sm.getFatigue(tokenD) == 0 ) {
    sm.styledChatMessage(itemName, '', `You are not fatigued.`)       
    return;
  }

  //Subtract item
  await sm.useItem(tokenD, itemName);
  
  // remove 1 
  sm.applyFatigue(tokenD, -1);

  sm.styledChatMessage(itemName, '', `${tokenD.actor.name} used a ${itemName} and removed 1 level of fatigue.`);
}
const potionName = 'Potion of Healing';

/* 
source: 
icon: 
*/
const version = 'v0.1';
let tokenD=canvas.tokens.controlled[0];
const myTitle = `Potion`;
let message1 = ``;
let message2 = potionName;
  
if (tokenD===undefined) {
  ui.notifications.error("Please select a token."); // No Token is Selected
} else {
  main();
} 

// Modified from a macro by spacemandev
async function main() {
  let myPotion = actor.items.find(item => item.data.name == potionName);
  if(myPotion == null || myPotion == undefined) {
    sm.styledChatMessage(potionName, '', `You don't have any of them.`);       
    return;
  }
  
  //If token is max health if so, don't do anything
  if(actor.data.data.wounds.value == 0) {
    sm.styledChatMessage(potionName, '', `You are not injured.`);       
    return;
  }

  //Subtract a health potion
  await myPotion.update({"data.quantity": myPotion.data.data.quantity - 1})
  if(myPotion.data.data.quantity < 1){
    myPotion.delete();
  }
  
  //// remove 1 current wound   ////// If so, we want the new health to max 
  let newHealth = actor.data.data.wounds.value - 1;

  //update the actor health
  await actor.update({"data.wounds.value": newHealth});

  sm.styledChatMessage(potionName, '', `${tokenD.actor.name} drank a ${potionName} and cured 1 wound.`);
}
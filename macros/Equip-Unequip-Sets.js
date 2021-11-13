/*
icon: icons/magic/time/arrows-circling-pink.webp
Macros for SWADE
*/
const setName1 = '#equipSet1';
const setName2 = '#equipSet2';
const version = 'v0.1';

let tokenD;
if (canvas.tokens.controlled[0]===undefined) {
  ui.notifications.error("Please, select a token."); // No Token is Selected
} else {
  tokenD = canvas.tokens.controlled[0];
  main();
}

async function main() {  
  let message=``;
  let itemsSet1 = tokenD.actor.items.filter( e => e.data.data.description.search(setName1)!=-1 ); // get set1
  let itemsSet2 = tokenD.actor.items.filter( e => e.data.data.description.search(setName2)!=-1 ); // get set1
  
  const itemsSet1Size = itemsSet1.filter( e => e.data.data.equipped==true ).length;
  const itemsSet2Size = itemsSet2.filter( e => e.data.data.equipped==true ).length;
  
  //check if any item from set 1 is equipped
  if ( itemsSet1Size>0 ) { // true means set1 is on, so turn them off and turn set2 on
    for (var item of itemsSet1) {
      await item.update({"data.equipped" : false});
    }      
    for (var item of itemsSet2) {
      await item.update({"data.equipped" : true});
    }          
  } else if (itemsSet2Size>0) {
    for (var item of itemsSet2) {
      await item.update({"data.equipped" : false});
    }      
    for (var item of itemsSet1) {
      await item.update({"data.equipped" : true});
    }         
  } else {
    message += `<p>You need to add to description of the item a set tag. For the fist set use ${setName1} for the second set use ${setName2}</p>`;
  }   

  let chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
    content: message
  };  
  ChatMessage.create(chatData, {});

}

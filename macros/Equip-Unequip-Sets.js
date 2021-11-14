/*
icon: icons/magic/time/arrows-circling-pink.webp
Macros for SWADE
*/
const setName1 = '#equipSet1';
const setName2 = '#equipSet2';

const version = 'v0.2';

let tokenD;
if (canvas.tokens.controlled[0]===undefined) {
  ui.notifications.error("Please, select a token."); // No Token is Selected
} else {
  tokenD = canvas.tokens.controlled[0];
  main();
}

async function main() {  
  let message=``;
  var tmp='';  

  let itemsSet1 = tokenD.actor.items.filter( e => e.data.data.description?.includes(setName1)); // get set1
  let itemsSet2 = tokenD.actor.items.filter( e => e.data.data.description?.includes(setName2)); // get set2

  const itemsSet1FullSize = itemsSet1.length;
  const itemsSet2FullSize = itemsSet2.length;
 
  const itemsSet1Size = itemsSet1.filter( e => e.data.data.equipped==true ).length;
  const itemsSet2Size = itemsSet2.filter( e => e.data.data.equipped==true ).length;
  
  //check if any item from set 1 is equipped
  if ( itemsSet1Size>0 ) { // true means set1 is on, so turn them off and turn set2 on
    for (var item of itemsSet1) {
      await item.update({"data.equipped" : false});
    }    
    if (itemsSet2FullSize>0) {    
      tmp = '';   
      for (var item of itemsSet2) {
        await item.update({"data.equipped" : true});
        tmp+= `<li>${item.name}</li>`;
      }     
    }
  } else if (itemsSet2Size>0) { // true set3 is on
    for (var item of itemsSet2) {
      await item.update({"data.equipped" : false});
    }         
    if (itemsSet1FullSize>0) {    
      tmp = '';   
      for (var item of itemsSet1) {
        await item.update({"data.equipped" : true});
        tmp+= `<li>${item.name}</li>`;
      } 
    }
  } else { 
    for (var item of itemsSet2) {
      await item.update({"data.equipped" : false});
    }         
    if (itemsSet1FullSize>0) {
      tmp = '';       
      for (var item of itemsSet1) {
        await item.update({"data.equipped" : true});
        tmp+= `<li>${item.name}</li>`;
      }    
    }
  }   
  
  if (tmp!='') {
    message+=`<p>${tokenD.actor.name} equipped:</p>`;
    message+=`<ul>${tmp}</ul>`;    
    
    let chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      content: message
    };  
    ChatMessage.create(chatData, {});
  }
}


/*
  // debug -------------------------------
  tokenD.actor.items.filter( e => e.name=='Rapier')[0]
  tokenD = canvas.tokens.controlled[0];
  tokenD.actor.items.filter( e => e.name=='Bow (long)')[0].data.data.description?.includes(setName1)
  tokenD.actor.items.filter( e => e.name=='Rapier')[0].data.data.description?.includes(setName2)
  
  tokenD.actor.items.filter( e => e.data.data.description?.includes(setName2));
  
  console.log('-------------------')
  console.log('itemsSet1')
  console.log(itemsSet1)
  console.log('itemsSet2')
  console.log(itemsSet2)  
  console.log('-------------------')
  // debug --------------------------------
*/
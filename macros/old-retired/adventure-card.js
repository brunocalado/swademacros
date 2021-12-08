/* Adventure Card
source: 
icon: icons/sundries/gaming/playing-cards-grey.webp

*/

const version = 'v1.0';
const icon = 'icons/sundries/gaming/playing-cards-grey.webp';
const adventureCardName = 'Adventure Card';
const showTableDrawToChat = false;
const resetTableAfterGiveCards = true;
let tableToDrawAdventureCards = 'Action Cards';

if ( canvas.tokens.controlled[0]===undefined ) {
  ui.notifications.error("Please, select a token."); // No Token is Selected
} else {
  main();
}

function main() {
  let tokens = canvas.tokens.controlled;
  let playersNames = tokens.map((p=> p.data.name)); 

  let playerNameList = `<option value="everyone" selected>Everyone</option>`;
  for (var tokenD of tokens) {
    playerNameList += `<option value="${tokenD.actor.id}">${tokenD.name}</option>`;
  }  
  
  let tableNameList = ``;
  Array.from(game.tables).map((t) => {
      tableNameList += `<option value="${t.data.name}">${t.data.name}</option>`;
  });
    
  let template = `
    <style type="text/css">
      .tg  {border-collapse:collapse;border-spacing:0;margin:0px auto;}
      .tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
        overflow:hidden;padding:10px 5px;word-break:normal;}
      .tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
        font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
      .tg .tg-baqh{text-align:center;vertical-align:top}
      .tg .tg-xwyw{border-color:#000000;text-align:center;vertical-align:middle}
    </style>
    
    <table class="tg">
    <tbody>
      <tr>
        <td class="tg-baqh">
          <b>All selected tokens will receive Adventure Cards</b>
        </td>      
      </tr>
      
      <tr>
        <td class="tg-xwyw" colspan="4"><b>Players: </b><select id="playerName" style="width: 200px">${playerNameList}</select></td>
      </tr>
      
      <tr>
        <td class="tg-xwyw" colspan="4"><b>Tables: </b><select id="tableName" style="width: 200px">${tableNameList}</select></td>
      </tr>

    </tbody>
    </table>    
   
  `;
  
  new Dialog({
    title: `Adventure Card - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "Apply",
        callback: async (html) => {
          adventureCardManager(html);
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
  }).render(true);
}

// -------------------------------------------------------
// Functions
async function adventureCardManager(html) {
  let actorID = html.find("#playerName")[0].value;  
  tableToDrawAdventureCards = html.find("#tableName")[0].value;  

  if (actorID=='everyone') {    
    let tokens = canvas.tokens.controlled;
    for (var tokenD of tokens) {
      let actorid = tokenD.actor.id;
      const processing = await updateAdventureCards(actorid);
      cardMessage(actorid);
    }
  } else { 
    await updateAdventureCards(actorid);
    cardMessage(actorid);
  }  
    
  if (resetTableAfterGiveCards) {
    const processing = await game.tables.find((t) => t.data.name == tableToDrawAdventureCards).reset();
  }
}

async function updateAdventureCards(actorID) {
  let character = game.actors.get(actorID);
    
  await wipeAdventureCards(actorID); // wipe all cards
  
  // get amount of cards to give
  const cardsToGive = await getAdventureCardsToDraw(actorID);
  
  // draw cards
  let selectedCards = await game.tables
            .find((t) => t.data.name == tableToDrawAdventureCards)
            .drawMany(cardsToGive, { displayChat: showTableDrawToChat })

  // add cards to the actor
  for (var selectedCard of selectedCards.results) {    
    const processing = await createCard(actorID, selectedCard);
  }  
}

async function wipeAdventureCards(actorID) {
  let character = game.actors.get(actorID);
    
  //let cards = character.items.filter(e => e.name===adventureCardName);    
  let cards = character.items.filter(item => item.getFlag('swademacros','type') === "Adventure Card" );
  const ids = cards.map( card => card.id );
  await character.deleteEmbeddedDocuments('Item', ids);        
}

async function createCard(actorID, selectedCard) { 
  let rules = '';

  let imageLink = selectedCard.data.img;
  let resultName = selectedCard.data.text;
  
  if (resultName=='') {
    resultName = adventureCardName;
  }
  
  let character = game.actors.get(actorID);
  let data = [{
    name: resultName,
    type: 'gear',
    img: icon,   
    data: {
      "description": `<img src="${imageLink}"/>`
    },
    flags:{
      'swademacros': {
        type: 'Adventure Card'
      }
    }    
  }];  
  //await item.setFlag('swademacros', 'type', 'Adventure Card')
  //(async) setFlag(scope, key, value) → {Promise.<Document>}
  // getFlag(scope, key) → {*}
  // getFlag('swademacros', 'type') 

  let createCard = await character.createEmbeddedDocuments('Item', data);
  //createCard.setFlag('swademacros', 'type', 'Adventure Card');
}

async function cardMessage(actorID) {
  let character = game.actors.get(actorID);  
  const amountCards = await getAdventureCardsToDraw(actorID);
  let message1 = `<b>${character.name}</b> received <b>${amountCards}</b> cards.`;
  let message2 = `Check your items. Your card is under <b>gear</b>.`;
  sm.styledChatMessage('Adventure Cards', message1, message2);
}

async function getAdventureCardsToDraw(actorID) {
  let character = game.actors.get(actorID);  
  if (character.data.data.additionalStats.adventurecards!=undefined) {
    return parseInt(character.data.data.additionalStats.adventurecards.value);
  } else if (getCardsByRank(actorID)!=0) {
    return getCardsByRank(actorID);
  } else {
    return 1;
  }
}

async function getCardsByRank(actorID) {
  let character = game.actors.get(actorID);  
  switch (character.data.data.advances.rank) {
  case 'Novice':
    return 1;
  case 'Seasoned':
    return 2;
  case 'Veteran':
    return 3;
  case 'Heroic':
    return 4;
  case 'Legendary':
    return 5;    
  default:
    ui.notifications.error("I couldn't identify your rank."); 
    return 0;    
  }
}


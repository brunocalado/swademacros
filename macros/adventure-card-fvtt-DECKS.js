/* Adventure Deck
source:
icon: icons/sundries/gaming/playing-cards-grey.webp

SNIPPETS: https://gitlab.com/peginc/swade/-/blob/develop/src/module/chaseUtils.ts#L108
API: https://foundryvtt.com/api/Cards.html#_drawCards
*/

const version = 'v1.0';
const icon = 'icons/sundries/gaming/playing-cards-grey.webp';
const adventureCardName = 'Adventure Card';
const flagType = 'Adventure Card'
const showTableDrawToChat = false;
const defaultDeck = game.settings.get("swademacros", "adventuredeckdeck");
let tableToDrawAdventureCards = 'Action Cards';

if (canvas.tokens.controlled[0] === undefined) {
  ui.notifications.error("Please, select a token."); // No Token is Selected
} else {
  main();
}

function main() {
  const tokens = canvas.tokens.controlled;

  let playerNameList = `<option value="everyone" selected>Everyone</option>`;
  for (const tokenD of tokens) {
    playerNameList += `<option value="${tokenD.actor.id}">${tokenD.name}</option>`;
  }

  let tableNameList = ``;  
  Array.from(game.cards).map((t) => {
    if (defaultDeck==t.data.name) {
      tableNameList += `<option value="${t.data.name}" selected>${t.data.name}</option>`;
    } else {
      tableNameList += `<option value="${t.data.name}">${t.data.name}</option>`;
    }
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
        icon: "<i class='fas fa-dice'></i>",
        label: "Give Cards",
        callback: async (html) => {
          adventureCardManager(html);
        },
      },
      reset: {
        icon: "<i class='fas fa-skull'></i>",
        label: "Reset Deck",
        callback: async (html) => {
          resetDeck(html)
        }
      },
      cancel: {
        icon: "<i class='fas fa-window-close'></i>",        
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

  if (actorID == 'everyone') {
    let tokens = canvas.tokens.controlled;
    for (var tokenD of tokens) {
      let actorID = tokenD.actor.id;
      await updateAdventureCards(actorID);
      cardMessage(actorID);
    }
  } else {
    await updateAdventureCards(actorID);
    cardMessage(actorID);
  }

}

async function updateAdventureCards(actorID) {
  // get amount of cards to give
  const cardsToGive = await getAdventureCardsToDraw(actorID);
  //get deck
  const deck = await game.cards.find((t) => t.data.name == tableToDrawAdventureCards);
  let cardsDrawn = deck._drawCards(3, CONST.CARD_DRAW_MODES.TOP);
  let updates = cardsDrawn.map((v) => {
    return {
      _id: v.id,
      drawn: true,
    };
  });
  await deck.updateEmbeddedDocuments('Card', updates);

  // add cards to the actor
  await createCards(actorID, cardsDrawn); 
}

async function wipeAdventureCards(actorID) {
  const character = await game.actors.get(actorID);

  const cards = await character.items.filter(item => item.getFlag('swademacros', 'type') === flagType);

  for (const card of cards) {
    await card.delete()
  }
}

async function createCards(actorID, cardsDrawn) { 
  const cardsToAdd = []
  const character = await game.actors.get(actorID);
  for (const card of cardsDrawn) {
    const resultName = card.name;

    if (resultName == '') {
      resultName = adventureCardName;
    }

    const data = {
      name: resultName,
      type: 'gear',
      img: icon,
      data: {
        description: `<img src="${card.img}"/>`
      }
    };

    cardsToAdd.push(data)
  }
  const cards = await character.createEmbeddedDocuments('Item', cardsToAdd);
  //const cards = await character.getEmbeddedCollection('Item').filter((i) => i.getFlag('swademacros', 'type') === flagType);
  for (const card of cards) {
    await card.setFlag('swademacros', 'type', flagType)
  }
}

async function cardMessage(actorID) {
  const character = game.actors.get(actorID);
  const amountCards = await getAdventureCardsToDraw(actorID);
  const message1 = `<b>${character.name}</b> received <b>${amountCards}</b> cards.`;
  const message2 = `Check your items. Your card is under <b>gear</b>.`;
  sm.styledChatMessage('Adventure Cards', message1, message2);
}

async function getAdventureCardsToDraw(actorID) {
  const character = await game.actors.get(actorID);
  const cardsByRank = await getCardsByRank(actorID);
  
  if (character.data.data.additionalStats.adventurecards != undefined) {
    return parseInt(character.data.data.additionalStats.adventurecards.value);
  } else if (  cardsByRank != 0) {
    return cardsByRank;
  } else {
    return 1;
  }
}

async function getCardsByRank(actorID) {
  const character = game.actors.get(actorID);
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
      return 0;
  }
}

async function resetDeck(html) {
  tableToDrawAdventureCards = html.find("#tableName")[0].value;
  
  // Remove from actors
  const actorsWithCards = await game.actors.filter((a) => a.items.some((i) => i.getFlag('swademacros', 'type') === flagType))
  for (const actor of actorsWithCards) {
    const cardItems = await actor.items.filter((i) => i.getFlag('swademacros', 'type') === flagType)

    for (const item of cardItems) {
      await item.delete()
    }
  }
  
  // Reset the table
  const deck = await game.cards.find((t) => t.data.name == tableToDrawAdventureCards);
  await deck.reset({ chatNotification: false });
  await deck.shuffle({ chatNotification: false });
  
  sm.styledChatMessageSimple('Adventure Cards', `<p>The deck was reset. The adventure cards were removed from the actors.</p>`);
}

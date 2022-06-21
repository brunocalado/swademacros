const version = 'v2.0';

const deckName = game.settings.get("swademacros", "chasedeck");
const transparentCardPath = 'modules/swademacros/images/card_transparent.webp';

/* Smart Chase
Features
- Draw n cards placing them in the scene
- This macro can reset the table preventing from the error
- This macro can line up the cards
source:
icon: icons/sundries/gaming/playing-cards.webp
*/

layoutChase();

async function layoutChase() {
  const deck = await game.cards.find((t) => t.data.name == deckName);

  //return if no canvas or scene is available
  if (!canvas || !canvas.ready || !canvas.scene) {
    return ui.notifications.warn('SWADE.NoSceneAvailable', {
      localize: true
    });
  }

  if (!deck || deck.type !== 'deck') {
    return ui.notifications.warn('Please provide a deck! Check Macros for SWADE settings.');
  }

  // Create the dialog template
  const template = `<h2>Important</h2>
  <p>You need to set the scene before run this macro. Read Macros for SWADE documentation.</p>
  </br>
  `;
  
  new Dialog({
    title: `Smart Chase - ${version}`,
    content: template,
    buttons: {
      ok: {
        icon: "<i class='fas fa-dice'></i>",
        label: "Give Cards",
        callback: async (html) => {
          createChaseTiles(html, deck);
        },
      },
      reset: {
        icon: "<i class='fas fa-skull'></i>",
        label: "Reset Deck",
        callback: async (html) => {
          resetDeck(deck)
        }
      },
      cancel: {
        icon: "<i class='fas fa-window-close'></i>",        
        label: "Cancel",
      },
    },
  }).render(true);    
  
}

async function removeChaseTiles(scene) {
  const chaseCards = Tagger.getByTag("swademacroscard");
  
  // If there are any, make it transparent them and display a notice
  if (chaseCards.length) {
    for (const card of chaseCards) {
      await card.update({img: transparentCardPath});
    }
    ui.notifications.info('SWADE.ChaseCardsCleared', { localize: true });
  }
}

// This function adds tiles to the scene.
async function createChaseTiles(html, deck) {
  //return if no canvas or scene is available
  if (!canvas || !canvas.ready || !canvas.scene) return;
  
  // read all cards with swademacroscard
  const chaseCards = Tagger.getByTag("swademacroscard");
  
  // total number of cards to be drawn.
  const cardsToDraw = chaseCards.length; 

  // Draw the cards.
  const cardsDrawn = deck._drawCards(cardsToDraw, CONST.CARD_DRAW_MODES.TOP);
  const updates = cardsDrawn.map((v) => {
    return {
      _id: v.id,
      drawn: true,
    };
  });
  // set the cards to drawn
  await deck.updateEmbeddedDocuments('Card', updates);

  let counter = 0;
  const tiles = new Array;
  // position a card
  for (let chaseCard of chaseCards) {
    await chaseCard.update({img: cardsDrawn[counter].face.img});
    counter+=1;
  }

}

async function resetDeck(deck) {
  await deck.reset({ chatNotification: false });
  await deck.shuffle({ chatNotification: false });
  ui.notifications.info(`The Deck "${deck.name}" has been reset.`);
  removeChaseTiles(canvas.scene);  
}
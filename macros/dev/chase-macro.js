const version = 'v2.0';
const sm = game.modules.get('swademacros')?.api.sm;
//const defaultTable = game.settings.get("swademacros", "chasedeck");
const deckName = 'Savage Pathfinder Action Deck';

/* Chase
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
    return ui.notifications.warn('Please provide a deck!');
  }

  // Create the dialog template
  const template = `
  <style scoped>
      .custom-sizing-spacing {
          margin: 1em 0;
      }
      .fields-grid {
          display: grid;
          grid-template-columns: repeat(4, min-content);
          justify-content: center;
          align-items: center;
          grid-gap: 1em;
      }
  </style>
  <form>
      <fieldset>
          <legend>Layout</legend>
          <div class="fields-grid">
              <label for="card-rows">Rows:</label><input id="card-rows" type="number" min="1" style="width: 50px;" value="1">
              <label for="card-columns">Columns:</label><input id="card-columns" type="number" min="1" style="width: 50px;" value="9">
          </div>
      </fieldset>
      <br>
  </form>
`;
  
  new Dialog({
    title: `Chase - ${version}`,
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
  const chaseCards = scene.tiles.filter((t) =>
    Boolean(t.getFlag('swade', 'isChaseCard')),
  );
  // If there are any, delete them and display a notice
  if (chaseCards.length) {
    for (const card of chaseCards) {
      await card.delete();
    }
    ui.notifications.info('SWADE.ChaseCardsCleared', { localize: true });
  }
}

// This function adds tiles to the scene.
async function createChaseTiles(html, deck) {
  //return if no canvas or scene is available
  if (!canvas || !canvas.ready || !canvas.scene) return;

  // Get size of grid square.
  const grid = canvas.scene.data.grid;
  // Set spacing to half a grid square.
  let spacing = grid / 2;
  // Define the number of rows.
  const rows = Number(html.find('#card-rows').first().val());
  // Define the number of columns.
  const columns = Number(html.find('#card-columns').first().val());
  // Calculate the total number of cards to be drawn.
  const cardsToDraw = rows * columns;

  console.log(columns)

  /**
   * Set the dimensions of the card. This assumes U.S.poker card sizes and
   * is based on the size of the grid squares. This emulates the scale between minis and playing
   * cards on the tabletop.
   */
  let cardHeight = grid * (deck.data.height ?? 3.5);
  let cardWidth = grid * (deck.data.width ?? 2.5);

  // Draw the cards.
  //@ts-expect-error It's technically a protected method but we're borrowing here
  const cardsDrawn = deck._drawCards(cardsToDraw, CONST.CARD_DRAW_MODES.TOP);
  const updates = cardsDrawn.map((v) => {
    return {
      _id: v.id,
      drawn: true,
    };
  });
  // set the cards to drawn
  await deck.updateEmbeddedDocuments('Card', updates);

  /**
   * Get the width and height of the scene and it's rectangle area.
   * This will be compared to the size of the spread later to make sure the cards aren't tiled off canvas.
   */
  // https://github.com/League-of-Foundry-Developers/foundry-vtt-types/blob/main/src/foundry/common/documents.mjs/baseScene.d.ts
  const sceneWidth = canvas.scene.dimensions.sceneWidth;
  const sceneHeight = canvas.scene.dimensions.sceneHeight;
  const sceneRectX = canvas.scene.dimensions.paddingX;
  const sceneRectY = canvas.scene.dimensions.paddingY;

  /**
   * Calculate the default width and height of the full spread based on number of cards, card sizes, and spacing between cards.
   */
  // Calculate the total spacing between columns.
  let totalSpacingX = spacing * (columns - 1);
  // Calculate the total spacing between rows.
  let totalSpacingY = spacing * (rows - 1);
  // Calculate the total width of the spread based on card sizes, number of columns, and spacing.
  let fullSpreadWidth = cardWidth * columns + totalSpacingX;
  // Calculate the total height of the spread based on card sizes, number of rows, and spacing.
  let fullSpreadHeight = cardHeight * rows + totalSpacingY;

  // Check to see if the default full spread is bigger than the scene, and if so...
  if (fullSpreadWidth > sceneWidth || fullSpreadHeight > sceneHeight) {
    let newSpreadRatio = 1;

    // If it's bigger than the width...
    if (fullSpreadWidth > sceneWidth) {
      // Identify the ratio between the scene width and the full spread width.
      newSpreadRatio = sceneWidth / fullSpreadWidth;
      // Modify the card width based on the new ratio.
      cardWidth = cardWidth * newSpreadRatio;
      // Modify the card height based on the new ratio.
      cardHeight = cardHeight * newSpreadRatio;
      // Modify the spacing based on the new ratio.
      spacing = spacing * newSpreadRatio;
      // Calculate the new total horizontal spacing.
      totalSpacingX = spacing * (columns - 1);
      // Calculate the new total vertical spacing.
      totalSpacingY = spacing * (rows - 1);
      // Calculate the new full spread dimensions.
      fullSpreadWidth = cardWidth * columns + totalSpacingX;
      fullSpreadHeight = cardHeight * rows + totalSpacingY;
    }

    /**
     * It's necessary to run these calculations again if the height is
     * still bigger than the canvas even after resizing for the width.
     */

    if (fullSpreadHeight > sceneHeight) {
      // Identify the ratio between the scene height and the full spread height.
      newSpreadRatio = sceneHeight / fullSpreadHeight;
      // Modify the card width based on the new ratio.
      cardWidth = cardWidth * newSpreadRatio;
      // Modify the card height based on the new ratio.
      cardHeight = cardHeight * newSpreadRatio;
      // Modify the spacing based on the new ratio.
      spacing = spacing * newSpreadRatio;
      // Calculate the new total horizontal spacing.
      totalSpacingX = spacing * (columns - 1);
      // Calculate the new total vertical spacing.
      totalSpacingY = spacing * (rows - 1);
      // Calculate the new full spread dimensions.
      fullSpreadWidth = cardWidth * columns + totalSpacingX;
      fullSpreadHeight = cardHeight * rows + totalSpacingY;
    }
  }

  // Calculate the start positions so that the chase track is centered on the scene.
  const startX = sceneRectX + (sceneWidth - fullSpreadWidth) / 2;
  const startY = sceneRectY + (sceneHeight - fullSpreadHeight) / 2;

  // Set the first value of positionY and positionX to the base start positions.
  let positionY = startY;
  let positionX = startX;
  let counter = 0;
  const tiles = new Array;
  // For each row, position a card in each column
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      // Set the tile data for size and position. Use a flag to identify the tile as a Chase card for deletion later.
      const tData = {
        img: cardsDrawn[counter].face.img,
        width: cardWidth,
        height: cardHeight,
        x: positionX,
        y: positionY,
        'flags.swade.isChaseCard': true,
      };
      // Update positionX for the next card's placement.
      positionX = positionX + cardWidth + spacing;
      // Save the tile data
      tiles.push(tData);
      // Increment the counter for the next card in the cardDraws Array.
      counter++;
    }
    // Update positionY for the next row of cards.
    positionY = positionY + cardHeight + spacing;
    // Reset positionX to the original horizontal start position for the new row.
    positionX = startX;
  }
  //finally, create the cards on the scene
  await canvas.scene.createEmbeddedDocuments('Tile', tiles);
}

async function resetDeck(deck) {
  await deck.reset({ chatNotification: false });
  await deck.shuffle({ chatNotification: false });
  ui.notifications.info(`The Deck "${deck.name}" has been reset.`);
  removeChaseTiles(canvas.scene);  
}
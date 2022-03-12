const version = 'v1.6';

/* Chase
Features
- Draw n cards placing them in the scene
- This macro can reset the table preventing from the error
- This macro can line up the cards
- This macro assumes there is a RollTable with the name "Chase Deck".
  - You can edit the name of the RollTable below
source:
icon: icons/sundries/gaming/playing-cards.webp
*/
// Edit the name of your Chase Deck here.
const tableName = 'Chase Deck';

const grid = canvas.scene.data.grid;

async function makeTiles(html) {
    let spacing = grid / 2;
    let rows = parseInt(html.find('#card-rows')[0].value);
    let columns = parseInt(html.find('#card-columns')[0].value);
    let cardsToDraw = rows * columns;
    let cardHeight = grid * 3.5;
    let cardWidth = grid * 2.5;

    let cardDraws = (
        await game.tables
            .find((t) => t.data.name == tableName)
            .drawMany(cardsToDraw, { displayChat: false })
    ).results;

    const sceneWidth = canvas.scene.dimensions.sceneWidth;
    const sceneHeight = canvas.scene.dimensions.sceneHeight;
    const sceneRectX = canvas.scene.dimensions.sceneRect.x;
    const sceneRectY = canvas.scene.dimensions.sceneRect.y;

    let totalSpacingX = spacing * (columns - 1);
    let totalSpacingY = spacing * (rows - 1);
    let fullSpreadWidth = (cardWidth * columns) + totalSpacingX;
    let fullSpreadHeight = (cardHeight * rows) + totalSpacingY;

    if (fullSpreadWidth > sceneWidth || fullSpreadHeight > sceneHeight) {
        let newSpreadRatio = 1;

        if (fullSpreadWidth > sceneWidth) {
            newSpreadRatio = sceneWidth / fullSpreadWidth;
            cardWidth = cardWidth * newSpreadRatio;
            cardHeight = cardHeight * newSpreadRatio;
            spacing = spacing * newSpreadRatio;
            totalSpacingX = spacing * (columns - 1);
            totalSpacingY = spacing * (rows - 1);
            fullSpreadWidth = cardWidth * columns + totalSpacingX;
            fullSpreadHeight = cardHeight * rows + totalSpacingY;
        }

        if (fullSpreadHeight > sceneHeight) {
            newSpreadRatio = sceneHeight / fullSpreadHeight;
            cardWidth = cardWidth * newSpreadRatio;
            cardHeight = cardHeight * newSpreadRatio;
            spacing = spacing * newSpreadRatio;
            totalSpacingX = spacing * (columns - 1);
            totalSpacingY = spacing * (rows - 1);
            fullSpreadWidth = cardWidth * columns + totalSpacingX;
            fullSpreadHeight = cardHeight * rows + totalSpacingY;
        }
    }

    let startX = sceneRectX + ((sceneWidth - fullSpreadWidth) / 2);
    let startY = sceneRectY + ((sceneHeight - fullSpreadHeight) / 2);

    let positionY = startY;
    let positionX = startX;
    let counter = 0;

    let tData;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            tData = {
                img: cardDraws[counter].data.img,
                width: cardWidth,
                height: cardHeight,
                x: positionX,
                y: positionY,
                'flags.swademacros.isChaseCard': true
            };
            positionX = positionX + cardWidth + spacing;
            await TileDocument.create(tData, { parent: canvas.scene });
            counter++;
        }
        positionY = positionY + cardHeight + spacing;
        positionX = startX;
    }
}

function main() {
    //How Many Cards to Draw
    //Width/Height
    //Which Table to Draw From
    let template = `
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
                  </tr>
                </tbody>
                </table>
            </fieldset>
        </form>
        `;
    new Dialog({
        title: `Draw Cards To Table - ${version}`,
        content: template,
        buttons: {
            ok: {
                label: 'Draw',
                callback: async (html) => {
                    makeTiles(html);
                },
            },
            resetTable: {
                label: 'Reset',
                callback: async () => {
                    const table = await game.tables.find((t) => t.data.name === tableName);
                    if (table !== undefined) {
                        table.reset();
                        ui.notifications.info(`The RollTable "${tableName}" has been reset.`)

                    } else {
                        ui.notifications.warn(`The RollTable "${tableName}" was not found.`)
                    }
                    const chaseCards = await canvas.scene.tiles.filter(t => t.getFlag('swademacros', 'isChaseCard') === true);
                    if (chaseCards.length) {
                        for await (const card of chaseCards) {
                            await card.delete();
                        }
                        ui.notifications.info(`All tiles from ${tableName} have been removed from the scene.`)
                    }
                }
            },
            cancel: {
                label: 'Cancel',
            },
        },
    }).render(true);
}

main();
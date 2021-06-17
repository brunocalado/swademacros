const version = 'v1.7';

/* Chase
Features
- Draw n cards placing them in the scene
- This macro can reset the table preventing from the error
- This macro can line up the cards
source:
icon: icons/sundries/gaming/playing-cards.webp
*/

async function makeTiles(html) {
    let spacingX = parseInt(html.find('#spacing-x')[0].value);
    let spacingY = parseInt(html.find('#spacing-y')[0].value);
    const rows = parseInt(html.find('#card-rows')[0].value);
    const columns = parseInt(html.find('#card-columns')[0].value);
    const stackCards = html.find('#stack-cards')[0].checked;
    const tableName = html.find('#table-name')[0].value;
    let cardHeight = parseInt(html.find('#card-height')[0].value);
    let cardWidth = parseInt(html.find('#card-width')[0].value);

    if (tableName === '') {
        ui.notifications.warn(`Please select a RollTable from which to draw.`);
    } else {
        const cardsToDraw = rows * columns;
        const cardDraws = (
            await game.tables
                .find((t) => t.data.name == tableName)
                .drawMany(cardsToDraw, { displayChat: false })
        ).results;

        const sceneWidth = canvas.scene.dimensions.sceneWidth;
        const sceneHeight = canvas.scene.dimensions.sceneHeight;
        const sceneRectX = canvas.scene.dimensions.sceneRect.x;
        const sceneRectY = canvas.scene.dimensions.sceneRect.y;

        let totalSpacingX = spacingX * (columns - 1);
        let totalSpacingY = spacingY * (rows - 1);
        let fullSpreadWidth = (cardWidth * columns) + totalSpacingX;
        let fullSpreadHeight = (cardHeight * rows) + totalSpacingY;

        if (fullSpreadWidth > sceneWidth || fullSpreadHeight > sceneHeight) {
            let newSpreadRatio = 1;

            if (fullSpreadWidth > sceneWidth) {
                newSpreadRatio = sceneWidth / fullSpreadWidth;
                cardWidth = cardWidth * newSpreadRatio;
                cardHeight = cardHeight * newSpreadRatio;
                spacingX = spacingX * newSpreadRatio;
                spacingY = spacingY * newSpreadRatio;
                totalSpacingX = spacingX * (columns - 1);
                totalSpacingY = spacingY * (rows - 1);
                fullSpreadWidth = cardWidth * columns + totalSpacingX;
                fullSpreadHeight = cardHeight * rows + totalSpacingY;
            }

            if (fullSpreadHeight > sceneHeight) {
                newSpreadRatio = sceneHeight / fullSpreadHeight;
                cardWidth = cardWidth * newSpreadRatio;
                cardHeight = cardHeight * newSpreadRatio;
                spacingX = spacingX * newSpreadRatio;
                spacingY = spacingY * newSpreadRatio;
                totalSpacingX = spacingX * (columns - 1);
                totalSpacingY = spacingY * (rows - 1);
                fullSpreadWidth = cardWidth * columns + totalSpacingX;
                fullSpreadHeight = cardHeight * rows + totalSpacingY;
            }
        }

        let startX = sceneRectX + ((sceneWidth - fullSpreadWidth) / 2);
        let startY = sceneRectY + ((sceneHeight - fullSpreadHeight) / 2);

        if (stackCards) {
            startX = sceneRectX + ((sceneWidth - cardWidth) / 2);
            startY = sceneRectY + ((sceneHeight - cardHeight) / 2);
        }

        let positionX = startX;
        let positionY = startY;
        let i = 0;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                const tData = {
                    img: cardDraws[i].data.img,
                    width: cardWidth,
                    height: cardHeight,
                    x: positionX,
                    y: positionY,
                    'flags.swademacros.isChaseCard': true
                };
                if (!stackCards) {
                    positionX = positionX + cardWidth + spacingX;
                }
                await TileDocument.create(tData, { parent: canvas.scene });
                i++;
            }
            if (!stackCards) {
                positionY = positionY + cardHeight + spacingY;
            }
            positionX = startX;
        }
    }
}

function main() {
    //How Many Cards to Draw
    //Width/Height
    //Which Table to Draw From
    const grid = canvas.scene.data.grid;

    let cardsList = ``;
    Array.from(game.tables).map((t) => {
        cardsList += `<option value="${t.data.name}">${t.data.name}</option>`;
    });

    const template = `
        <style scoped>
            .custom-sizing-spacing {
                margin: 1em 0;
            }
        </style>
        <form>
            <fieldset>
                <legend>Choose a Roll Table</legend>
                <p>
                    <label for="table-name">Table to Draw From: <select id="table-name">${cardsList}</select></label>
                </p>
            </fieldset>
            <fieldset>
                <legend>Layout</legend>
                <table style="text-align: center;">
                <tbody>
                  <tr>
                    <td><label for="card-rows">Rows: <input id="card-rows" type="number" min="1" style="width: 50px;" value="1"></label></td>
                    <td><label for="card-columns">Columns: <input id="card-columns" type="number" min="1" style="width: 50px;" value="9"></label></td>
                  </tr>
                </tbody>
                </table>
                <p>--OR--</p>
                <p>
                    <label for="stack-cards"><input type="checkbox" id="stack-cards"/> Stack cards into single pile</label>
                </p>
            </fieldset>
            <details class="custom-sizing-spacing">
                <summary>Customize Card Size and Spacing</summary>
                <fieldset>
                    <legend>Card Size (in pixels)</legend>
                    <table style="text-align: center;">
                    <tbody>
                      <tr>
                        <td>
                          <label for="card-height">Height: <input id="card-height" type="number" min="1" style="width: 50px;" value="${grid * 3.5}"></label>
                        </td>
                        <td>
                          <label for="card-width">Width: <input id="card-width" type="number" min="1" style="width: 50px;" value="${grid * 2.5}"></label>
                        </td>
                      </tr>
                    </tbody>
                    </table>
                </fieldset>
                <fieldset>
                    <legend>Spacing between Cards (in pixels)</legend>
                      <table style="text-align: center;">
                      <tbody>
                        <tr>
                          <td>
                            <label for="spacing-x">Columns: <input id="spacing-x" type="number" min="0" value="${grid / 2}" step="1" style="width: 50px;"></label>
                          </td>
                          <td>
                            <label for="spacing-y">Rows: <input id="spacing-y" type="number" min="0" value="${grid / 2}" step="1" style="width: 50px;"></label>
                          </td>
                        </tr>
                      </tbody>
                      </table>
                </fieldset>
            </details>
        </form>
        `;
    new Dialog({
        title: `Draw Cards To Table - ${version}`,
        content: template,
        buttons: {
            ok: {
                label: `<b>Draw</b>`,
                callback: async (html) => {
                    makeTiles(html);
                },
            },
            resetTable: {
                label: `<b style="color:red">Reset</b>`,
                callback: async (html) => {
                    const tableName = html.find('#table-name')[0].value;
                    const table = await game.tables.find((t) => t.data.name === tableName);
                    if (table !== undefined) {
                        table.reset();
                        ui.notifications.info(`The RollTable "${tableName}" has been reset.`)

                    } else {
                        ui.notifications.warn(`Please select a RollTable to reset.`)
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
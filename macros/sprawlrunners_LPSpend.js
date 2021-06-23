const version = 'v1.2';
const chatimage = "icons/commodities/treasure/puzzle-box-glowing-blue.webp";
const rule = '@Compendium[sprawl-core-rules.sprawl-rules.jhEs3al7qA4sAwaa]{Logistics Points}';
let coreRules = false;
if (game.modules.get("sprawl-core-rules")?.active) { coreRules = true; }

/* LP Check

TODO 
- async

source: https://gitlab.com/sigil-vtt-projects/sprawlrunners/sprawlrunners/-/issues/10
icon: icons/commodities/treasure/puzzle-box-glowing-blue.webp
*/

let grandTotal = 0;
let grandTotalMax = 0;
let message;

if (coreRules) {
  message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${rule}</h2></div><ul>`;
} else {
  message = `<div><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Logistics Points</h2><div><ul>`;
}

let characters = game.actors.contents.filter(e => e.data.type === 'character' && e.hasPlayerOwner);

if (characters==undefined) {
  ui.notifications.warn("Each player should own a character!");    
} else {
  for(const character of characters) {
    if (character.data.data.additionalStats.LP==undefined) {
      ui.notifications.error("You need to check Enabled for LP in player Tweaks!");
      return;
    }   
    
    let maxLP = character.data.data.additionalStats.LP.max;

    let total = character.items.map(i => i.data.data).filter(p => (p.price > 0) && (p.equipped) ).reduce((total, curr) => total + curr.price, 0);
    /*let total = character.items
        .map(i => i.data.data.price)
        .filter(p => p > 0)
        .reduce((total, curr) => total + curr, 0);*/

    message += `<li> ${character.name}: <b style="color:darkblue">${total}</b> of <b style="color:red">${maxLP}</b> </li>`;

    character.update({"data.additionalStats.LP.value": total});

    grandTotal += total;
    grandTotalMax += maxLP;
  }

  message += `</ul><p>Total: <b style="color:darkblue">${grandTotal}</b> of <b style="color:red">${grandTotalMax}</b> </p>`;

  // to chat
  let chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
    content: message
  };

  ChatMessage.create(chatData, {});
}
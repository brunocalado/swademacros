const version = 'v1.4';

/* Unshaken

source: 
icon: icons/magic/control/fear-fright-white.webp
*/
const chatimage = "icons/magic/control/fear-fright-white.webp";
let coreRules = false;
if (game.modules.get("swade-core-rules")?.active) { coreRules = true; }
const coreRulesLink = '@Compendium[swade-core-rules.swade-rules.30TJKevSbgxK6jQy]{Shaken}';
let tokenD=canvas.tokens.controlled[0];

if (tokenD===undefined) {
  ui.notifications.error("Please select a token."); // No Token is Selected
} else {
  tokenD = canvas.tokens.controlled[0];
  main();
}

async function main() {
  if (tokenD.actor.data.data.status.isShaken === true) {
    rollUnshake();
  } else if (tokenD) {
    await tokenD.actor.update({ "data.status.isShaken": true });
    ChatMessage.create({
      user: game.user.id,      
      content: `<p><b style="color:red">${tokenD.name}</b> is Shaken now!</p>`,
    });        
  }
}

async function rollUnshake() {
  const edgeNames = ['combat reflexes', 'demon', 'undead', 'construct', 'undead (harrowed)'];
  let message = ``;
  let rolled = await tokenD.actor.rollAttribute('spirit');    // ROLL SPIRIT AND CHECK COMBAT REFLEXES
  
  const edges = tokenD.actor.data.items.filter(function (item) {
    return edgeNames.includes(item.name.toLowerCase()) && (item.type === "edge" || item.type === "ability");
  });
  
  let rollWithEdge = rolled.total;
  let edgeText = "";
  for (let edge of edges) {
    rollWithEdge += 2;
    edgeText += `<br/><i>+ ${edge.name}</i>`;
  }

  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${coreRulesLink}</h2></div>`;
  } else {
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Shaken</h2>`;
  }

  message += `${tokenD.name} rolled <b style="color:blue"> ${rollWithEdge} </b>`;
  
  // Checking for a Critical Failure.
  if ( sm.isCritical(rolled) ) {
    ui.notifications.notify("You've rolled a Critical Failure!");
    message += `<b>${tokenD.name}</b> rolled a <b style="color: red; font-size:150%">Critical Failure!</b>!`;    
  } else {
    if (rollWithEdge <= 3) {
      message += ` and remains Shaken.`;
      sm.useBenny(tokenD);
    } else if (rollWithEdge >= 4) {
      message += `, is no longer Shaken and may act normally.`;
      await tokenD.actor.update({ "data.status.isShaken": false });
    }
    message += ` ${edgeText}`;
  }
  ChatMessage.create({ content: message });
}


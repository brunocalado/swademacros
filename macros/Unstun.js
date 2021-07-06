const version = 'v1.0';

/* Unstun

source: 
icon: icons/magic/symbols/symbol-lightning-bolt.webp
*/
const chatimage = "icons/magic/symbols/symbol-lightning-bolt.webp";
let coreRules = sm.isModuleOn("swade-core-rules");
const coreRulesLink = '@Compendium[swade-core-rules.swade-rules.nHbnnGpaM8CgA5SI]{Stunned}';
let tokenD=canvas.tokens.controlled[0];

if (tokenD===undefined) {
  ui.notifications.error("Please select a token."); // No Token is Selected
} else {
  tokenD = canvas.tokens.controlled[0];
  main();
}

async function main() {
  if (tokenD.actor.data.data.status.isStunned === true) {
    rollUnstun();
  } else if (tokenD) {
    let message = ``;
    
    if (tokenD.actor.data.data.status.isStunned === false) {
      await tokenD.actor.update({ "data.status.isStunned": true });
    };

    if ( sm.isModuleOn("combat-utility-belt") ) {
      await game.cub.addCondition("Prone");
    };
    await tokenD.actor.update({ "data.status.isDistracted": true });
    await tokenD.actor.update({ "data.status.isVulnerable": true });

    if (coreRules) {
      message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${coreRulesLink}</h2></div>`;
    } else {
      message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Stunned</h2>`;      
    }
    
    message += `<p><b style="color:red">${tokenD.name}</b> is <b>stunned</b> now!</p>`
    ChatMessage.create({
      user: game.user.id,      
      content: message,
    });        
  }
}

async function rollUnstun() {
  const edgeNames = ['combat reflexes'];
  let message = ``;
  let rolled = await tokenD.actor.rollAttribute('vigor');
  
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
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Stunned</h2>`;
  }

  message += `<p>${tokenD.name} rolled <b style="color:blue"> ${rollWithEdge}.</b></p>`;
  
  // Checking for a Critical Failure.
  if ( sm.isCritical(rolled) ) {
    ui.notifications.notify("You've rolled a Critical Failure!");
    message += `<b>${tokenD.name}</b> rolled a <b style="color: red; font-size:150%">Critical Failure!</b>!`;    
  } else {
    if (rollWithEdge > 3 && rollWithEdge <= 7) {
      message += `<p>${tokenD.name} is no longer Stunned.</p>`;
      message += `<ul><li>remains Vulnerable until end of next turn.</li>`;
      message += `<li>remains Distracted until end of this turn.</li></ul>`;
      await tokenD.actor.update({ "data.status.isVulnerable": true });
      await tokenD.actor.update({ "data.status.isStunned": false });
      sm.useBenny(tokenD);
    } else if (rollWithEdge >= 8) {
      message += `<p>${tokenD.name} is no longer Stunned and looses Vulnerable/Distracted.</p>`;
      await tokenD.actor.update({ "data.status.isDistracted": false });
      await tokenD.actor.update({ "data.status.isStunned": false });
      await tokenD.actor.update({ "data.status.isVulnerable": false });
    } else {
      message += `<p>${tokenD.name} remains Stunned.</p>`;
      sm.useBenny(tokenD);
    }
    message += ` ${edgeText}`;
  }
  ChatMessage.create({ content: message });
}
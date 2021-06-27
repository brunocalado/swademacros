/*
Healing
- Med kit heal faz roll
- Natural heal faz roll

icon: icons/magic/life/cross-area-circle-green-white.webp
*/

let token;
const version = 'v1.3';
const chatimage = "icons/magic/life/cross-area-circle-green-white.webp";
let coreRules = false;
if (game.modules.get("swade-core-rules")?.active) { coreRules = true; }

if (canvas.tokens.controlled[0]===undefined) {
  ui.notifications.error("Please, select a token."); // No Token is Selected
} else {
  token = canvas.tokens.controlled[0];
  main();
}

function main() {
  let dialogText = ``;
  
  dialogButtons = {
    one: {
      label: "Natural Healing",
      callback: (html) => {
        naturalHeal(html);
      }
    },
    two: {
      label: "Healing Skill",
      callback: (html) => {
        skillHeal(html);
      }
    }
  }

  // Main Dialogue    
  new Dialog({
    title: 'Healing',
    content: dialogText,
    buttons: dialogButtons,
    default: "one",
  }).render(true);

}

// MACRO FUNCTIONS

/*
Wounded characters make a Vigor roll every five days. Success recovers one Wounds, and a raise recovers two.
A Critical Failure increases the victim’s Wounds level by one—either from infection, blood loss, or aggravating the injuries. If this causes Incapacitation, don’t use the usual rules for taking damage. Instead, the victim lapses in and out of consciousness and makes a Vigor roll every 12 hours. If the roll is failed, he expires. Success means he must roll again 12 hours later. With a raise he stabilizes and wakes. Allies may also attempt to stabilize the hero as explained under Bleeding Out, above.
Support: Don’t forget to use Support when your party has been beaten up a bit. Characters with Healing, Survival, or other skills can make Support rolls to help allies make their Vigor rolls to heal!
*/
async function naturalHeal(html) {
  const edgeNames = ['fast healer'];  
  // Roll Vigor and check for Fast Healer.
  let rolled = await token.actor.rollAttribute('vigor');
  let r = rolled;
  
  const edges = token.actor.data.items.filter(function (item) {
    return edgeNames.includes(item.name.toLowerCase()) && (item.type === "edge" || item.type === "ability");
  });
  let rollWithEdge = r.total;
  let edgeText = "";
  for (let edge of edges) {
    rollWithEdge += 2;
    edgeText += `<br/><i>+ ${edge.name}</i>`;
  }
  r = rollWithEdge;
  
  // Roll Vigor including +2 if Fast Healer is present and another +2 if this is a reroll.
  let message;
  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> @Compendium[swade-core-rules.swade-rules.gCrNh35pUQHaVN4J]{Healing}</h2></div>`;
  } else {
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Healing</h2>`;
  }

  // Checking for a Critical Failure.  
  if ( sm.isCriticalBeta(rolled) ) {
    message += `${token.name} rolled a <b style="color: red; font-size:150%">Critical Failure!</b> and takes another Wound!`;    
    sm.applyWounds(token, 1);
    ChatMessage.create({ content: message });
  } else {
    message += `<p><b style="color:red">${token.name}</b> rolled <b style="color:blue">${r}</b>`;    
    if (r < 4) {
      message += ` and is <b style="color:red">unable to heal</b> any Wounds.</p>`;
    } else if ( r>=4 && r<8 ) {
      message += ` and heals <b style="color:darkgreen">1</b> of his ${sm.getWounds(token)} Wounds.</p>`;      
      sm.applyWounds(token, -1);
    } else if ( r>8 ) {
      message += ` and heals <b style="color:darkgreen">2</b> of his ${sm.getWounds(token)} Wounds.</p>`;      
      sm.applyWounds(token, -2);
    }
        
    message += ` ${edgeText}`;
  }

  message += `<ul><li>This roll can be done every five day</li></ul>`;

  ChatMessage.create({ content: message });
}

/*
Healing skill: Each attempt requires 10 minutes per wound level of the patient. Subtract 1 from Healing rolls without a basic First Aid kit or similar supplies.
A success removes one Wound, and a raise removes two. Failure means no Wounds are removed. A Critical Failure increases the victim’s Wound level by one.
*/
async function skillHeal(html) {
  // Roll Vigor and check for Fast Healer.  
  let r = await sm.rollSkill(token, 'healing');  
  let rolled = r;

  let message;
  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> @Compendium[swade-core-rules.swade-rules.gCrNh35pUQHaVN4J]{Healing}</h2></div>`;
  } else {
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Healing</h2>`;
  }

  r = r.total;

  // Checking for a Critical Failure.
  if ( sm.isCriticalBeta(rolled) ) {
    message += `${token.name} rolled a <b style="color: red; font-size:150%">Critical Failure!</b> and takes another Wound!`;    
    sm.applyWounds(token, 1);
  } else {
    let skill = 'Healing'.toLowerCase();
    let actorSkill = token.actor.data.items.find(i => (i.name.toLowerCase() === skill) );
    let skillName; 
    if (!actorSkill) {skillName = 'Untrained';} else {skillName = actorSkill.name;}
    message += `<p><b style="color:red">${token.name}</b> rolled <b style="color:blue">${r}</b> with <b style="color:darkgreen">${skillName}</b>`;
    if (r < 4) {
      message += ` and is <b style="color:red">unable to heal</b> any Wounds.</p>`;
    } else if ( r>=4 && r<8 ) {
      message += ` and heals <b style="color:darkgreen">1</b> of his ${sm.getWounds(token)} Wounds.</p>`;      
      sm.applyWounds(token, -1);
    } else if ( r>8 ) {
      message += ` and heals <b style="color:darkgreen">2</b> of his ${sm.getWounds(token)} Wounds.</p>`;      
      sm.applyWounds(token, -2);
    }
  }
  
  message += `<ul>
  <li><b>Subtract 1</b> from Healing rolls without a basic First Aid kit or similar supplies.</li>
  <li>This attempt required <b>${sm.getWounds(token)*10}</b> minutes</li></ul>`;
  
  ChatMessage.create({ content: message });
}

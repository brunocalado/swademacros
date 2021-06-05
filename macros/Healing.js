/*
Healing
- Med kit heal faz roll
- Natural heal faz roll
- Fatigue

icon: icons/magic/life/cross-area-circle-green-white.webp
*/

let token;
const version = 'v1.0';
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
        naturalHeal();
      }
    },
    two: {
      label: "Healing Skill",
      callback: (html) => {
        skillHeal();
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
function naturalHeal() {
  const edgeNames = ['fast healer'];
  // Roll Vigor and check for Fast Healer.
  let rolled = rollAttribute(token, 'vigor');  
  let trait = rolled.terms[0].rolls[0].total;
  let wild = rolled.terms[0].rolls[1].total;
  let r = Math.max( trait, wild ) ;
  
  const edges = token.actor.data.items.filter(function (item) {
    return edgeNames.includes(item.name.toLowerCase()) && (item.type === "edge" || item.type === "ability");
  });
  let rollWithEdge = r;
  let edgeText = "";
  for (let edge of edges) {
    rollWithEdge += 2;
    edgeText += `<br/><i>+ ${edge.name}</i>`;
  }

  // Roll Vigor including +2 if Fast Healer is present and another +2 if this is a reroll.
  let message;
  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> @Compendium[swade-core-rules.swade-rules.gCrNh35pUQHaVN4J]{Healing}</h2></div>`;
  } else {
    message = `<div><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Healing</h2>`;
  }
   
  // Checking for a Critical Failure.
  if ( isCritical(rolled) ) {
    message += `${actorAlias} rolled a <b style="color: red; font-size:150%">Critical Failure!</b> and takes another Wound!`;
    applyWounds(token, 1);
    ChatMessage.create({ content: message });
  } else {
    message += `<p><b style="color:red">${token.name}</b> rolled <b style="color:blue">${r}</b>`;    
    if (r < 4) {
      message += ` and is <b style="color:red">unable to heal</b> any Wounds.</p>`;
    } else if ( r>=4 && r<8 ) {
      message += ` and heals <b style="color:darkgreen">1</b> of his ${getWounds(token)} Wounds.</p>`;
      applyWounds(token, -1);
    } else if ( r>8 ) {
      message += ` and heals <b style="color:darkgreen">2</b> of his ${getWounds(token)} Wounds.</p>`;
      applyWounds(token, -2);
    }
        
    message += ` ${edgeText}`;
    message += `<ul>
    <li><b>Subtract 1</b> from Healing rolls without a basic First Aid kit or similar supplies.</li>
    <li>This attempt required <b>${getWounds(token)*10}</b> minutes</li></ul>`;    
  }
  
  ChatMessage.create({ content: message });
  rolled.toMessage();
}

/*
Healing skill: Each attempt requires 10 minutes per wound level of the patient. Subtract 1 from Healing rolls without a basic First Aid kit or similar supplies.
A success removes one Wound, and a raise removes two. Failure means no Wounds are removed. A Critical Failure increases the victim’s Wound level by one.
*/
function skillHeal() {
  // Roll Vigor and check for Fast Healer.
  let rolled = rollSkill(token, 'healing');  
  let trait = rolled.terms[0].rolls[0].total;
  let wild = rolled.terms[0].rolls[1].total;
  let r = Math.max( trait, wild ) ;

  let message;
  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> @Compendium[swade-core-rules.swade-rules.gCrNh35pUQHaVN4J]{Healing}</h2></div>`;
  } else {
    message = `<div><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Healing</h2></div>`;
  }

  // Checking for a Critical Failure.
  if ( isCritical(rolled) ) {
    message += `${actorAlias} rolled a <b style="color: red; font-size:150%">Critical Failure!</b> and takes another Wound!`;
    applyWounds(token, 1);
  } else {
    let skill = 'Healing'.toLowerCase();
    let actorSkill = token.actor.data.items.find(i => (i.name.toLowerCase() === skill) );
    let skillName; 
    if (!actorSkill) {skillName = 'Untrained';} else {skillName = actorSkill.name;}
    message += `<p><b style="color:red">${token.name}</b> rolled <b style="color:blue">${r}</b> with <b style="color:darkgreen">${skillName}</b>`;
    if (r < 4) {
      message += ` and is <b style="color:red">unable to heal</b> any Wounds.</p>`;
    } else if ( r>=4 && r<8 ) {
      message += ` and heals <b style="color:darkgreen">1</b> of his ${getWounds(token)} Wounds.</p>`;
      applyWounds(token, -1);
    } else if ( r>8 ) {
      message += ` and heals <b style="color:darkgreen">2</b> of his ${getWounds(token)} Wounds.</p>`;
      applyWounds(token, -2);
    }
  }
  
  message += `<ul>
  <li><b>Subtract 1</b> from Healing rolls without a basic First Aid kit or similar supplies.</li>
  <li>This attempt required <b>${getWounds(token)*10}</b> minutes</li></ul>`;
  
  ChatMessage.create({ content: message });
  rolled.toMessage();
}

// COMMONS v0.1
function rollAttribute(myActor, attribute) {
  let diceExpression;
  if (attribute=='agility') {
    diceExpression = '{1d' + myActor.actor.data.data.attributes.agility.die.sides + 'x+' + myActor.actor.data.data.attributes.agility.die.modifier+',1d6x}';      
  } else if (attribute=='smarts') {
    diceExpression = '{1d' + myActor.actor.data.data.attributes.smarts.die.sides + 'x+' + myActor.actor.data.data.attributes.smarts.die.modifier+',1d6x}';      
  } else if (attribute=='spirit') {
    diceExpression = '{1d' + myActor.actor.data.data.attributes.spirit.die.sides + 'x+' + myActor.actor.data.data.attributes.spirit.die.modifier+',1d6x}';      
  } else if (attribute=='strength') {
    diceExpression = '{1d' + myActor.actor.data.data.attributes.strength.die.sides + 'x+' + myActor.actor.data.data.attributes.strength.die.modifier+',1d6x}';      
  } else if (attribute=='vigor') {
    diceExpression = '{1d' + myActor.actor.data.data.attributes.vigor.die.sides + 'x+' + myActor.actor.data.data.attributes.vigor.die.modifier+',1d6x}';      
  }
  return new Roll(diceExpression).roll({ async : false });  
}

function rollSkill(myActor, skill) { 
  let actorSkill = myActor.actor.data.items.find(i => (i.name.toLowerCase() === skill.toLowerCase()) );
  let diceExpression;
  if (actorSkill) { // healing
    let actorSkillMod = actorSkill.data.data.die.modifier;
    if(!actorSkillMod) { actorSkillMod = 0; }
    diceExpression = '{1d'+actorSkill.data.data.die.sides + 'x+' + actorSkillMod + ',1d6x}';
  } else { // untrained
    diceExpression = '{1d4x-2,1d6x}';
  }
  return new Roll(diceExpression).roll({ async : false });  
}

async function applyWounds(token, val) {
  let currentWounds = getWounds(token);
  if ( (currentWounds+val)>3 ) {
    await token.actor.update({ "data.wounds.value": 3 });
  } else if ( (currentWounds+val)<0 ) {
    await token.actor.update({ "data.wounds.value": 0 });
  } else {
    await token.actor.update({ "data.wounds.value": (currentWounds+val) });
  }
}

function getWounds(token) {
  return token.actor.data.data.wounds.value;
}

function isCritical(rolled) {
  let trait = rolled.terms[0].rolls[0].terms[0].results[0].result;  
  let wild = rolled.terms[0].rolls[1].terms[0].results[0].result;  
  return (trait==1 && wild==1);
}

function isWildCard(token) {  
  return token.actor.data.data.wildcard;
}

/* Power Point Management
- 

icon: icons/magic/symbols/elements-air-earth-fire-water.webp
*/

let token;
const version = 'v1.0';
const chatimage = "icons/magic/symbols/elements-air-earth-fire-water.webp";
let coreRules = sm.isModuleOn("swade-core-rules");

if (canvas.tokens.controlled[0]===undefined) {
  ui.notifications.error("Please, select a token."); // No Token is Selected
} else {
  token = canvas.tokens.controlled[0];
  main();
}

function main() {
  let dialogText = `
    <p>Power Points: <input id="powerpoints" name="num" type="number" min="-30" max="30" style="width: 80px; text-align: center;" value=0></input>
    </p>
    <p>Only use this input if you will use the <b>Manual Change</b></p>
  `;
            
  dialogButtons = {
    one: {
      label: "Natural Recover",
      callback: (html) => {
        naturalRecover(html);
      }
    },
    two: {
      label: "Benny Recover",
      callback: (html) => {
        bennyRecover(html);
      }
    },
    three: {
      label: "Manual Change",
      callback: (html) => {
        manualChange(html);
      }
    }    
  }

  // Main Dialogue    
  new Dialog({
    title: `Power Point Management - ${version}`,
    content: dialogText,
    buttons: dialogButtons,
    default: "one",
  }).render(true);

}

// MACRO FUNCTIONS

/*
Recharging p151
A character recovers 5 Power Points per hour spent resting, meditating, etc.
*/
async function naturalRecover(html) {
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
  if ( sm.isCritical(rolled) ) {
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
REGAIN POWER POINTS: A character with an Arcane Background can spend a Benny to regain 5 Power Points (Power Points and their use are explained on page 147.)
*/
async function bennyRecover(html) {
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
  if ( sm.isCritical(rolled) ) {
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

async function manualChange(html) {
  
}
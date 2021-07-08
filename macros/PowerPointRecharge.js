
/* Power Point Management
- 

icon: icons/magic/symbols/elements-air-earth-fire-water.webp
*/

const version = 'v1.0';
const chatimage = "icons/magic/symbols/elements-air-earth-fire-water.webp";
const rule = '@Compendium[swade-core-rules.swade-rules.6SGCG8rZNklN3U6w]{Recharging}';
let coreRules = sm.isModuleOn("swade-core-rules");
let tokenD;

if (canvas.tokens.controlled[0]===undefined) {
  ui.notifications.error("Please, select a token."); // No Token is Selected
} else {
  tokenD = canvas.tokens.controlled[0];
  main();
}

function main() {
  let dialogText = `
    <p>Power Points: <input id="powerpoints" type="number" min="-30" max="30" style="width: 80px; text-align: center;" value=0></input>
    </p>
    <p style=text-align: center;">Only use this input if you will use the <b>Manual Change</b>.</p>
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

/*
  var two = {};
  two.label = "Benny Recover";
  two.callback = (callback: (html) => {
        manualChange(html);
      });
  dialogButtons.push({two: two});
*/

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
  let message;
  
  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${rule}</h2></div>`;
  } else {
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Recharging</h2>`;
  }

  changePowerPoints(tokenD, 5);
  message += `<p><b style="color:red;">${tokenD.name}</b> recovered 5 Power Points after 1 hour. The current power points are: <b>${tokenD.actor.data.data.powerPoints.value}</b> </p>`;

  ChatMessage.create({ content: message });
}

/*
REGAIN POWER POINTS: A character with an Arcane Background can spend a Benny to regain 5 Power Points (Power Points and their use are explained on page 147.)
*/
async function bennyRecover(html) {
  let message;
  
  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${rule}</h2></div>`;
  } else {
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Recharging</h2>`;
  }

  changePowerPoints(tokenD, 5);
  message += `<p><b style="color:red;">${tokenD.name}</b> recovered 5 Power Points after 1 hour. The current power points are: <b>${tokenD.actor.data.data.powerPoints.value}</b> </p>`;

  ChatMessage.create({ content: message });
}

async function manualChange(html) {
  
}

async function changePowerPoints(tokenD, val) {
  let maximumPP = tokenD.actor.data.data.powerPoints.max;
  let currentPP = tokenD.actor.data.data.powerPoints.value;
  
  if ( (currentPP+val)> maximumPP ) {
    await tokenD.actor.update({ "data.powerPoints.value": maximumPP });    
  } else if ( (currentPP+val)<0 ) {
    await tokenD.actor.update({ "data.powerPoints.value": 0 });    
  } else {
    await tokenD.actor.update({ "data.powerPoints.value": (currentPP+val) });    
  }  
}


/* Power Point Management
- 

icon: icons/magic/symbols/elements-air-earth-fire-water.webp
*/

const version = 'v1.1';
const sm = game.modules.get('swademacros')?.api.sm;
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

  <style type="text/css">
    .tg  {border-collapse:collapse;border-spacing:0;}
    .tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
      overflow:hidden;padding:10px 5px;word-break:normal;}
    .tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
      font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
    .tg .tg-c3ow{border-color:inherit;text-align:center;vertical-align:top}
    .tg .tg-xwyw{border-color:#000000;text-align:center;vertical-align:middle}
  </style>
  <table class="tg">
  <tbody>
    <tr>
      <td class="tg-xwyw">
        <p style=text-align: center;">Only use this input if you will use the <b>Manual Change</b>.</p>
      </td>
    </tr>
    <tr>
      <td class="tg-c3ow">
        <p>Power Points: <input id="powerpoints" type="number" min="-30" max="30" style="width: 80px; text-align: center;" value=0></input></p>
      </td>
    </tr>
  </tbody>
  </table>

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
  let message = '';
  
  await changePowerPoints(tokenD, 5);
  message += `<p><b style="color:red;">${tokenD.name}</b> recovered 5 Power Points after 1 hour. The current power points are: <b>${tokenD.actor.data.data.powerPoints.value}</b> </p>`;

  sm.styledChatMessageSimple('Recharging', message, chatimage);
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

  if ( sm.checkBennies(tokenD)>0 ) {
    sm.spendBenny(tokenD);
    await changePowerPoints(tokenD, 5);
    message += `<p><b style="color:red;">${tokenD.name}</b> recovered 5 Power Points after spent a benny. The current power points are: <b>${tokenD.actor.data.data.powerPoints.value}</b>.</p>`;
  } else {
    message += `<p><b style="color:red;">${tokenD.name}</b> don't have bennies to spend. The current power points are: <b>${tokenD.actor.data.data.powerPoints.value}</b>.</p>`;
  }

  ChatMessage.create({ content: message });
}

async function manualChange(html) {
  let message;
  const powerpoints = parseInt( html.find("#powerpoints")[0].value );    
  
  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${rule}</h2></div>`;
  } else {
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Recharging</h2>`;
  }

  await changePowerPoints(tokenD, powerpoints);
  
  message += `<p><b style="color:red;">${tokenD.name}</b> manually added ${powerpoints} Power Points. The current power points are: <b>${tokenD.actor.data.data.powerPoints.value}</b>.</p>`;
  
  ChatMessage.create({ content: message });
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


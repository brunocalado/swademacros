/* Fear Table
icon: icons/magic/death/undead-ghost-scream-teal.webp
*/

let tokenD;
const version = 'v1.2';
const chatimage = "icons/magic/death/undead-ghost-scream-teal.webp";
let coreRules = false;
let rules = '@Compendium[swade-core-rules.swade-rules.jaYcLBJnBk1ai5EH]{Fear}';
if (game.modules.get("swade-core-rules")?.active) { coreRules = true; }

if (canvas.tokens.controlled[0]===undefined) {
  ui.notifications.error("Please, select a token."); // No Token is Selected
} else {
  tokenD = canvas.tokens.controlled[0];
  main();
}

async function main(){
  new Dialog({
    title:"Fear Table Modifier",
    content: `
    <div style="display:flex">
      <p style="flex:3">Creature Fear Penalty: </p>
      <input type="number" id="fearPenalty" value=0 style="flex:1"/>
    </div>
    `,
    buttons: {
      roll: {
        label: "Roll",
        callback: (html) => {
          rollFearTable(html);
        }
      }, 
      cancel: {
        label: "Cancel"
      }
    }
  }).render(true)
}

async function rollFearTable(html) {
  let message=``;
  let tableFearID = await game.packs.get("swade-core-rules.swade-tables").index.find(el => el.name == "Fear Table")._id;
  let fearTable = await game.packs.get("swade-core-rules.swade-tables")
    .getDocument( tableFearID );

  const mod = html.find("#fearPenalty")[0].value;  
  const tableRoll = await new Roll(`1d20 + ${mod}`);  
  let output = await fearTable.draw({roll: tableRoll});
  let result = output.results[0].data.text;
  let total = output.roll.total;

  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${rules}</h2></div>`;
  } else {
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Fear</h2>`;
  }

  message += `<p><b style="color:red">${tokenD.name}</b> shoud deal with: </p>`;
  message += result;
  // send message
  let chatData = {
    content: message
  };
  ChatMessage.create(chatData, {});    
  
  applyFearOutcome(tokenD, total);
}

async function applyFearOutcome(tokenD, val) {   
  if ( val>=4 && val<=6 ) {
    await tokenD.actor.update({ "data.status.isDistracted": true });    
  } else if ( val>=7 && val<=9 ) {
    await tokenD.actor.update({ "data.status.isVulnerable": true });    
  } else if ( val>=10 && val<=12 ) {
    await tokenD.actor.update({ "data.status.isShaken": true });    
  } else if ( val==13 ) {
    await tokenD.actor.update({ "data.status.isStunned": true });    
  } else if ( val>=16 && val<=17 ) {
    await tokenD.actor.update({ "data.status.isShaken": true });    
  }  
}

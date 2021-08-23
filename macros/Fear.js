
/* Fear + Fear Table
icon: icons/magic/death/undead-ghost-scream-teal.webp
*/

let tokenD;
const version = 'v1.3';
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
    <h2>Creature Fear Penalty</h2>
    <p>
      <input type="number" id="fearPenalty" value=0 min="-20" max="+20" style="text-align:center;"/>
    </p>
    <br>
    
    <h2>Fear Type</h2>
    <p style="text-align: center;">
      <input type="radio" id="feartype1" name="feartype" value="nausea" checked>
      <label for="feartype1">Nausea</label>
      <input type="radio" id="feartype2" name="feartype" value="terror">
      <label for="feartype2">Terror</label>
    </p>
    <br>
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
  let mod = html.find("#fearPenalty")[0].value;  
  const fearType = html.find('input[name="feartype"]:checked').val();

  let message=``;
  let tableFearID = await game.packs.get("swade-core-rules.swade-tables").index.find(el => el.name == "Fear Table")._id;
  let fearTable = await game.packs.get("swade-core-rules.swade-tables")
    .getDocument( tableFearID );

  const rollOutcome = await rollSpirit();
  let shouldRollFearTable = false;

  let tableRoll;  
  let output;
  let result;
  let total;

  // chat message
  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${rules}</h2></div>`;
  } else {
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Fear</h2>`;
  }
    
  if (fearType=='nausea') {
    message += '<p>The fear source is <b>Nausea</b>.</p>';
    if (rollOutcome=='critical') {
      await tokenD.actor.update({ "data.status.isShaken": true });
      await sm.applyFatigue(tokenD, 1);
      shouldRollFearTable = true;
      message += '<p>You rolled a <b style="color:red">CRITICAL FAILURE</b>!</p>';
      message += '<p>You are <b>Shaken and Fatigued</b> and must roll on the <b>Fear Table</b> as well.</p>';
    } else if (rollOutcome=='failure') {
      await tokenD.actor.update({ "data.status.isShaken": true });
      await sm.applyFatigue(tokenD, 1);      
      message += '<p>You rolled a <b style="color:red">FAILURE</b>!</p>';
      message += '<p>You are <b>Shaken and Fatigued</b>.</p>';
    } else {
      message += '<p>You <b style="color:darkgreen">SUCCEEDED</b>!</p>';
    }
  } else {    
    if (rollOutcome=='critical') {
      mod = mod + 2;
      message += '<p>You rolled a <b style="color:red">CRITICAL FAILURE</b>!</p>';
      message += '<p>You must roll on the <b>Fear Table</b> with <b>+2</b>.</p>';
      shouldRollFearTable = true;
    } else if (rollOutcome=='failure') {
      message += '<p>You rolled a <b style="color:red">FAILURE</b>!</p>';
      message += '<p>You must roll on the <b>Fear Table</b>.</p>';
      shouldRollFearTable = true;
    } else {
      message += '<p>You <b style="color:darkgreen">SUCCEEDED</b>!</p>';
    }
  }    
  
  if (shouldRollFearTable) {
    tableRoll = await new Roll(`1d20 + ${mod}`);  
    output = await fearTable.draw({roll: tableRoll});
    result = output.results[0].data.text;
    total = output.roll.total;
    message += `<p><b style="color:red">${tokenD.name}</b> shoud deal with: </p>`;  
    message += result;    
  }
  
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

async function rollSpirit() {
  let rolled = await tokenD.actor.rollAttribute('spirit');    // ROLL SPIRIT AND CHECK COMBAT REFLEXES  
  let rolledTotal = rolled.total;
  
  // Checking for a Critical Failure.
  if ( sm.isCritical(rolled) ) {
    return 'critical';
  } else {    
    if (rolledTotal <= 3) {
      return 'failure';
    } else if (rolledTotal >= 4) {
      return 'success';
    }
  }
}
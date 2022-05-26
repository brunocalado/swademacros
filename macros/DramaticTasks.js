const version = 'v1.1';
const sm = game.modules.get('swademacros')?.api.sm;
const chatimage = 'icons/commodities/tech/detonator-timer.webp';
const coreRulesLink = '@Compendium[swade-core-rules.swade-rules.G9H6LoPoQu10TI4R]{Dramatic Tasks}';
let coreRules = sm.isModuleOn("swade-core-rules");

main();

function main() {  
  let template =`
<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;}
.tg td{border-color:black;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;
  overflow:hidden;padding:10px 5px;word-break:normal;}
.tg th{border-color:black;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;
  font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
.tg .tg-xwyw{border-color:#000000;text-align:center;vertical-align:middle}
.tg .tg-0lax{border-color:#000000;text-align:center;vertical-align:middle}
</style>

<table class="tg">
<tbody>
  <tr>
    <td class="tg-xwyw">
        <h3><b style="font-size:20px">Players</b></h3>
        <select id="playersAmount" name="playersAmount">
          <option value="1" selected="selected">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
        </select> 
    </td>
    <td class="tg-0lax">
      <h3><b style="font-size:20px">Difficult</b></h3>
      <p>
      <select id="difficult" name="difficult">
        <option value="challenging" selected="selected">Challenging</option>
        <option value="difficult">Difficult</option>
        <option value="complex">Complex</option>
      </select>  
      </p>
    </td>
  </tr>
</tbody>
</table>
`;
  
  new Dialog({
    title: `Dramatic Task - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "Guess!",
        callback: async (html) => {
          dramaticTask(html);
        },
      },
      cancel: {
        label: "Cancel",
      }
    },
    default: "ok"
  }, {}).render(true);
}


async function dramaticTask(html) {
  const players = html.find("#playersAmount")[0].value;    
  const difficult = html.find("#difficult")[0].value;      
  let message=``;
    
  if (coreRules === true) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${coreRulesLink}</h2></div>`;
  }  else {
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Dramatic Tasks</h2>`;      
  }
  
  message += calculateTaskTokens(players, difficult);

  // send message
  let chatData = {
    content: message,
    whisper : ChatMessage.getWhisperRecipients("GM")
  };
  ChatMessage.create(chatData, {}); 
}

function calculateTaskTokens(players, difficult) {
  let tasksTokens=0;
  let tasksTurns=0;
  let difficultName='';
  let message=``;
  if (difficult=='challenging') {
    tasksTokens=players*4;    
    tasksTurns=3;
    difficultName='Challenging';
  } else if (difficult=='difficult') {
    tasksTokens=players*6;    
    tasksTurns=4;
    difficultName='Difficult';
  } else if (difficult=='complex') {
    tasksTokens=players*8;
    tasksTurns=5;
    difficultName='Complex';
  }
  message+=`<p>This is <b>${difficult}</b> for <b>${players}</b> player(s).</p>`;
  message+=`<ul><li>Task Tokens: <b style="color:red;">${tasksTokens}</b></li><li>Rounds: <b style="color:red;">${tasksTurns}</b></p>`;
  return message;
}

/*
// prob ===============================================
async function resolveOneTask(skills) {    
    let outcome = 0; // "outcome" is "task tokens", ie. one per success plus one per raise
    for (const skillDie of skills) { 
        const diceFormula ="{" + skillDie + "x,d6x}kh";
        let diceRoll = new Roll(diceFormula);
        diceRoll.evaluate({async: false});
        outcome += Math.floor(diceRoll.result / 4);
        //console.log(`Result ${diceRoll.result} outcome is now ${outcome}`);
    }
    return outcome;
}

var attemptedTasks = Array.from(Array(1000).keys());
var sucessfulTasks = attemptedTasks.reduce((acumulador, numero) => {
  let outcome = resolveOneTask(["d8", "d8", "d8", "d8"]);
  if (outcome >= 6) { 
    acumulador++;
  }
  return acumulador;
}, 0)

let fraction = sucessfulTasks / attemptedTasks.length;
console.log(`Did ${attemptedTasks.length} tasks, ${sucessfulTasks} succeeded (${fraction})`);

javier
async function resolveOneTask(skills) {    
    let outcome = 0; // "outcome" is "task tokens", ie. one per success plus one per raise
    for (const skillDie of skills) { 
        const diceFormula ="{" + skillDie + "x,d6x}kh";
        let diceRoll = new Roll(diceFormula);
        diceRoll.evaluate({async: false});
        outcome += Math.floor(diceRoll.result / 4);
        //console.log(`Result ${diceRoll.result} outcome is now ${outcome}`);
    }
    return outcome;
}

var attemptedTasks = Array.from(Array(1000).keys());
var sucessfulTasks = attemptedTasks.reduce( async (acumulador) => {
  let outcome = resolveOneTask(["d8", "d8", "d8", "d8"]);
  if (outcome >= 6) { 
    await accumulador;
    return acumulador++;
  }
}, 0)

let fraction = sucessfulTasks / attemptedTasks.length;
console.log(`Did ${attemptedTasks.length} tasks, ${sucessfulTasks} succeeded (${fraction})`);
*/
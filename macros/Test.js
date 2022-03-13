const version = 'v1.3';
const chatimage = 'icons/skills/ranged/arrow-strike-apple-orange.webp';
let coreRules = sm.isModuleOn("swade-core-rules");
if (game.modules.get("swade-core-rules")?.active) { coreRules = true; }

/* Test
IMPORTANT
- 

TODO
- 
source: 
icon: icons/sundries/gaming/dice-pair-white-green.webp
*/

// Requires at least 1 target
let supporter;
let target;    
if (canvas.tokens.controlled[0]===undefined || Array.from(game.user.targets)[0]===undefined){
  ui.notifications.warn("You must select a token and target another one!");    
} else {
  supporter=canvas.tokens.controlled[0];
  target=Array.from(game.user.targets)[0];    
  main();
}

function main() {  

  let supporterSkills = sm.listSkills(supporter);
  let targetSkills = sm.listSkills(target);

  let supporterSkillsList = ``;
  supporterSkills.map((t) => {
    supporterSkillsList += `<option value="${t}">${t}</option>`;
  });

  let template = `  
    <h2>${supporter.name} will try to Test ${target.name}!</h2>
    
    <div class="divTable purpleHorizon">
    <div class="divTableBody">
    
    <div class="divTableRow" align="center">
    <div class="divTableCell">
        <b>Skill (Choose):</b> 
        <select id="skillAttacker" type="text">
          ${supporterSkillsList}
        </select>      
    </div>    
    </div>
    
    </div>
    </div>    
    
    <br>
    <h2>Options</h2>
    <div class="divTable purpleHorizon">
    <div class="divTableBody">
    
    <div class="divTableRow">
    <div class="divTableCell">
        <input type="checkbox" id="creativecombat"/>Creative Combat
    </div>
    </div>
    
    </div>
    </div> 
    <br>
  `;
  
  new Dialog({
    title: `Test - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "Test!",
        callback: async (html) => {
          testTarget(html);
        },
      },
      cancel: {
        label: "Cancel",
      }
    },
    default: "ok"
  }, { id: 'kultcss'}).render(true);
}

async function testTarget(html) {
  const skillSupporter = html.find("#skillAttacker")[0].value;    
  let creativecombat = html.find("#creativecombat")[0].checked;
  let supporterRolled;
  let total;
  let message;
  let message_temp=``;
  let word1 = 'Distracted';
  let word2 = 'Vulnerable';
  let word3 = 'Shaken';
  if (coreRules) {
    word1 = '@Compendium[swade-core-rules.swade-rules.R5Zjq1jL3Xc5VkcH]{Distracted}';
    word2 = '@Compendium[swade-core-rules.swade-rules.R5Zjq1jL3Xc5VkcH]{Vulnerable}';
    word3 = '@Compendium[swade-core-rules.swade-rules.HM1iVVbYciEa7X57]{Shaken}';
  }

  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> @Compendium[swade-core-rules.swade-rules.qxPv5O5AJdAKbVFi]{Test}</h2><div>`;
  } else {
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Push</h2>`;
  }   
  
  supporterRolled = await sm.rollSkill(supporter, skillSupporter);  
  total = supporterRolled.total;

  message += `<p><b style="color:darkblue">${supporter.name}</b> is trying to test <b style="color:darkred">${target.name}</b>.</p>`;  

  message_temp += `<p><b style="color:darkred">${target.name}</b> should roll <b style="color:red">${total}</b> or higher.</p>`;  
  message_temp += `<h3>Outcomes</h3>`;
  message_temp += `<ul><li><b style="color:darkred">${supporter.name}</b> succeeded: <b style="color:darkblue">${supporter.name}</b> can add ${word1} or ${word2} to <b style="color:darkred">${target.name}</b></li></ul>`;
  if (creativecombat==false) {
    message_temp += `<ul><li><b style="color:darkred">${supporter.name}</b> raised: <b style="color:darkblue">${supporter.name}</b> can add ${word1} or ${word2} to <b style="color:darkred">${target.name}</b> and <b style="color:darkred">${target.name}</b> is ${word3}.</li></ul>`; 
  }
  
  if ( sm.isCritical(supporterRolled) ) {
    message += `<p><b style="color:darkblue">${supporter.name}</b> rolled a <b style="color: red;">Critical Failure!</b>!</p>`;
  } else if ( total>=4 ) {
    message += `<p><b style="color:darkblue">${supporter.name}</b> rolled <b style="color: red;">${total}</b>!</p>`;
    message += message_temp;
    if (creativecombat==true) {
      message += `<br>`;
      message += await creativeCombatMessage();    
    }
  } else {
    message += `<p><b style="color:darkblue">${supporter.name}</b> failed!</p>`;    
  }

  // send message1
  let chatData = {
    content: message
  };  
  ChatMessage.create(chatData, {});
  
}

async function creativeCombatMessage() {
  let message=``;
  const tableCreativeCombatID = await game.packs.get("swade-core-rules.swade-tables").index.find(el => el.name == "Creative Combat")._id;
  let tableCreativeCombat = await game.packs.get("swade-core-rules.swade-tables").getDocument( tableCreativeCombatID );

  let output = await tableCreativeCombat.roll();
  let result = output.results[0].data.text;
  
  message += `<h3>Creative Combat</h3>`;
  message += `<p>If you got a raise, this will happen:</p>`;
  message += `<p>${result}</p>`;
  return `${message}`;
}
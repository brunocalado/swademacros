const version = 'v1.5';
const sm = game.modules.get('swademacros')?.api.sm;
const chatimage = "icons/skills/social/diplomacy-unity-alliance.webp";
let coreRules = false;
const coreRulesLink = '@Compendium[swade-core-rules.swade-rules.L8ifBUyo8n9IDqSc]{Support}';
if (game.modules.get("swade-core-rules")?.active) { coreRules = true; }

/* Support p104 SWADE core
IMPORTANT
- 

TODO
- 
source: 
icon: icons/skills/social/diplomacy-unity-alliance.webp
*/

/*
- list target skills
- search the same skill
- roll
- report outcome
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

  let supporterSkillsList = ``;
  supporterSkills.map((t) => {
    supporterSkillsList += `<option value="${t}">${t}</option>`;
  });

  let template = `      
    <h2 style="text-align:center;">${supporter.name} will try to Support ${target.name}.</h2>
    
    <div class="divTable purpleHorizon">
    <div class="divTableBody">
    
    <div class="divTableRow" align="center">
    <div class="divTableCell">
        Supporter Skill (Choose): 
        <select id="skillAttacker" type="text" style="width: 100px; text-align: center;">
          ${supporterSkillsList}
        </select>      
    </div>
    </div>
    
    </div>
    </div> 
    <br>    
  `;
  
  new Dialog({
    title: `Support - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "Support!",
        callback: async (html) => {
          support(html);
        },
      },
      cancel: {
        label: "Cancel",
      }
    },
    default: "ok"
  }, { id: 'kultcss'}).render(true);
}

async function support(html) {
  const skillSupporter = html.find("#skillAttacker")[0].value;    
  let supporterRolled;
  let total;
  let message;
  let modifier = 0;
  
  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${coreRulesLink}</h2><div>`;
  } else {
    message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Support</h2>`;
  }    

  supporterRolled = await sm.rollSkill(supporter, skillSupporter);  
  total = supporterRolled.total;

  message += `<p><b style="color:darkblue">${supporter.name}</b> is trying to support <b style="color:darkred">${target.name}</b> with <b>${skillSupporter}</b>.</p>`;  
  
  if ( sm.isCritical(supporterRolled) ) {
    message += `<p><b style="color:darkblue">${supporter.name}</b> rolled a <b style="color: red; font-size:150%">Critical Failure!</b>!</p>`;
    modifier = -2;
    message += `<p><b style="color:darkred">${target.name}</b> should roll with <b style="color:red">${modifier}</b>.</p>`;;
  } else if ( total>=4 && total<8 ) {
    message += `<p><b style="color:darkblue">${supporter.name}</b> rolled <b style="color: red;">${total}</b>!</p>`;
    modifier = 1;
    message += `<p><b style="color:darkred">${target.name}</b> should roll with <b style="color:red">${modifier}</b>.</p>`;;
  } else if ( total>=8 ) {
    message += `<p><b style="color:darkblue">${supporter.name}</b> rolled <b style="color: red;">${total}</b>!</p>`;
    modifier = 2;
    message += `<p><b style="color:darkred">${target.name}</b> should roll with <b style="color:red">${modifier}</b>.</p>`;;
  } else {
    message += `<p><b style="color:darkblue">${supporter.name}</b> rolled <b style="color: red;">${total}</b>!</p>`;
    message += `<p><b style="color:darkblue">${supporter.name}</b> failed!</p>`;    
  }

  

  // send message1
  let chatData = {
    content: message
  };  
  ChatMessage.create(chatData, {});  
}
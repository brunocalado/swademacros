const version = 'v1.0';
const chatimage = 'icons/sundries/gaming/dice-pair-white-green.webp';
let coreRules = false;
const coreRulesLink = '@Compendium[swade-core-rules.swade-rules.2aAyYC6n07MrZ47O]{Test}';
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
    <style type="text/css">
      div.purpleHorizon {
        border: 4px solid #ff0000;
        background-color: #000000;
        width: 100%;
        text-align: center;
        border-collapse: collapse;
      }
      .divTable.purpleHorizon .divTableCell, .divTable.purpleHorizon .divTableHead {
        border: 0px solid #550000;
        padding: 5px 2px;
      }
      .divTable.purpleHorizon .divTableBody .divTableCell {
        font-size: 13px;
        font-weight: bold;
        color: #FFFFFF;
      }
      
      .divTable{ display: table; }
      .divTableRow { display: table-row; }
      .divTableHeading { display: table-header-group;}
      .divTableCell, .divTableHead { display: table-cell;}
      .divTableHeading { display: table-header-group;}
      .divTableFoot { display: table-footer-group;}
      .divTableBody { display: table-row-group;}

      /* HIDE RADIO */
      [type=radio] { 
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      }

      /* IMAGE STYLES */
      [type=radio] + img {
      cursor: pointer;
      }

      /* CHECKED STYLES */
      [type=radio]:checked + img {
      outline: 4px solid #f00;
      }
      
      .container {
        position: relative;
        text-align: center;
        color: white;
      }
      /* Centered text */
      .centered {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 18px;
      }    

      #kultcss .window-content {    
        background: #000000;
      }     
      #kultcss .dialog-button {
        height: 40px;
        background: #000000;
        color: #ffffff;
        justify-content: space-evenly;
        align-items: center;
        cursor: pointer;
        border: none;    
      }  
      #kultcss header {
        background: #000000;
        border-radius: 0;    
        border: none;    
        margin-bottom: 2px;
        font-size: .75rem;
      }
    </style>    
    
    <h2 style="text-align:center; color:white">${supporter.name} will try to Test ${target.name}!</h2>
    
    <div class="divTable purpleHorizon">
    <div class="divTableBody">
    
    <div class="divTableRow">
    <div class="divTableCell">
        <p>Supporter Skill (Choose)</p>
        <select id="skillAttacker" type="text" style="width: 100px; box-sizing: border-box;border: none;background-color: #ff0000;color: white; text-align: center;">
          ${supporterSkillsList}
        </select>      
    </div>
    </div>
    
    </div>
    </div>    
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
  let supporterRolled;
  let total;
  let message;
  let message_temp=``;
  let word1 = 'Distracted';
  let word2 = 'Vulnerable';
  let word3 = 'Shaken';
  if (coreRules) {
    word1 = '@Compendium[swade-core-rules.swade-rules.vuud75GDkKL3NW10]{Distracted}';
    word2 = '@Compendium[swade-core-rules.swade-rules.vuud75GDkKL3NW10]{Vulnerable}';
    word3 = '@Compendium[swade-core-rules.swade-rules.30TJKevSbgxK6jQy]{Shaken}';
  }
  
  if (coreRules) {
      message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${coreRulesLink}</h2><div>`;
  } else {
     message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Push</h2>`;
  }    

  supporterRolled = await sm.rollSkill(supporter, skillSupporter);  
  total = supporterRolled.total;

  message += `<p><b style="color:darkblue">${supporter.name}</b> is trying to test <b style="color:darkred">${target.name}</b>.</p>`;  

  message_temp += `<p><b style="color:darkred">${target.name}</b> should roll <b style="color:red">${total}</b> or higher.</p>`;  
  message_temp += `<h3>Outcomes</h3>`;
  message_temp += `<ul><li><b style="color:darkred">${supporter.name}</b> succeeded: <b style="color:darkblue">${supporter.name}</b> can add ${word1} or ${word2} to <b style="color:darkred">${target.name}</b></li>`;
  message_temp += `<li><b style="color:darkred">${supporter.name}</b> raised: <b style="color:darkblue">${supporter.name}</b> can add ${word1} or ${word2} to <b style="color:darkred">${target.name}</b> and <b style="color:darkred">${target.name}</b> is ${word3}.</li></ul>`;

  
  if ( sm.isCritical(supporterRolled) ) {
    message += `<p><b style="color:darkblue">${supporter.name}</b> rolled a <b style="color: red; font-size:150%">Critical Failure!</b>!</p>`;
  } else if ( total>=4 ) {
    message += `<p><b style="color:darkblue">${supporter.name}</b> rolled <b style="color: red;">${total}</b>!</p>`;
    message += message_temp;
  } else {
    message += `<p><b style="color:darkblue">${supporter.name}</b> failed!</p>`;    
  }

  // send message1
  let chatData = {
    content: message
  };  
  ChatMessage.create(chatData, {});
  
}
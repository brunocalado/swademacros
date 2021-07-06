const version = 'v1.2';
const chatimage = "icons/creatures/mammals/bull-horned-blue.webp";
let coreRules = false;
const coreRulesLink = '@Compendium[swade-core-rules.swade-rules.GsNwqTjOQLVbQras]{Push}';
if (game.modules.get("swade-core-rules")?.active) { coreRules = true; }

/* Push p104 SWADE core
IMPORTANT
- 

TODO
- 
source: 
icon: icons/creatures/mammals/bull-horned-blue.webp
*/

// Requires at least 1 target
let attacker;
let target;    
if (canvas.tokens.controlled[0]===undefined || Array.from(game.user.targets)[0]===undefined){
  ui.notifications.warn("You must select a token and target another one!");    
} else {
  attacker=canvas.tokens.controlled[0];
  target=Array.from(game.user.targets)[0];    
  main();
}

function main() {  
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
    
    <h2 style="text-align:center; color:white">${attacker.name} will try to Push ${target.name}</h2>
    <div class="divTable purpleHorizon">
    <div class="divTableBody">
    
    <div class="divTableRow">
    <div class="divTableCell">
        <p>Running?</p>
        <input id="running" type="checkbox" style="width: 60px; box-sizing: border-box;border: none;background-color: #ff0000;color: white; text-align: center;" >       
    </div>    
    <div class="divTableCell">
        <p>Attacker Skill</p>
        <select id="skillAttacker" type="text" style="width: 100px; box-sizing: border-box;border: none;background-color: #ff0000;color: white; text-align: center;">
        <option value="Strength">Strength</option>
        <option value="Athletics" selected="selected">Athletics</option>
        </select>      
    </div>
    <div class="divTableCell">
        <p>Defender Skill</p>
        <select id="skillTarget" type="text" style="width: 100px; box-sizing: border-box;border: none;background-color: #ff0000;color: white; text-align: center;">
        <option value="Strength">Strength</option>
        <option value="Athletics" selected="selected">Athletics</option>
        </select>      
    </div>    
    <div class="divTableCell">      
      <p>Shields</p>
      <input id="shields" type="number" min="0" max="10" style="width: 60px; box-sizing: border-box;border: none;background-color: #ff0000;color: white; text-align: center;" value=0>       
    </div>   
    </div>
    
    </div>
    </div>

   
    </div>
    </div>
    
  `;
  
  new Dialog({
    title: `Push - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "Battle!",
        callback: async (html) => {
          pushTheTarget(html);
        },
      },
      cancel: {
        label: "Cancel",
      }
    },
    default: "ok"
  }, { id: 'kultcss'}).render(true);
}

async function pushTheTarget(html) {
  const skillAttacker = html.find("#skillAttacker")[0].value;    
  const skillTarget = html.find("#skillTarget")[0].value;    
  const shields = parseInt( html.find("#shields")[0].value );    
  const running = html.find("#running")[0].checked;
  
  let sizebonus = howBigAmI(attacker, target);
  let attackerRolled;
  let targetRolled;
  let targetProneRolled;
  //let rolls3D=[];
  
  let message;
  if (coreRules) {
      message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${coreRulesLink}</h2><div>`;
  } else {
     message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Push</h2>`;
  }    

  if ( skillAttacker.toLowerCase().includes('Athletics'.toLowerCase()) ) {
    attackerRolled = await sm.rollSkill(attacker, skillAttacker);  
  } else {
    attackerRolled = await attacker.actor.rollAttribute(skillAttacker);
  }

  if ( skillTarget.toLowerCase().includes('Athletics'.toLowerCase()) ) {
    targetRolled = await sm.rollSkillFor(target, skillAttacker);  
  } else {
    targetRolled = await target.actor.rollAttribute(skillAttacker);
  }
  
  let attackerResult = attackerRolled.total;
  let attackerCriticalFailure=false;  

  let targetResult = targetRolled.total;
  let targetCriticalFailure=false;    
  
  //other bonuses
  attackerResult+=shields;
  if (running) {attackerResult+=2;}
  
  message += `<p><b style="color:red">${attacker.name} (${attackerResult})</b> is trying to push <b style="color:darkblue">${target.name} (${targetResult})</b>.</p>`;  

  //prone
  targetProneRolled = rollSkill(target, 'Athletics');  
  //rolls3D.push(targetProneRolled);  
  let targetProneResult; //----------------prone
  let targetProneCriticalFailure=false;    
  if (isWildCard(target)) {
    let targetTrait = targetProneRolled.terms[0].rolls[0].total;
    let targetWild = targetProneRolled.terms[0].rolls[1].total;       
    targetProneResult = Math.max( targetTrait, targetWild );
    if ( targetTrait==1 && targetWild==1 ) {targetProneCriticalFailure=true;}
  } else {
    targetProneResult = targetProneRolled.total;
  }  
  //outcome  
  let distance;
  let proneBonusMessage=``;
  if ( (attackerResult>=4) && (attackerResult>targetResult) && sizebonus!=-1 ) { // success
    if ( (attackerResult+4)>=targetResult ) {
      if (sizebonus==0) {
        distance=2;        
      } else if (sizebonus>0) {
        distance=4;
      } 
      message += `<p>The ${target.name} is pushed ${distance} square(s).</p>`;
      targetProneResult+=-2;
      proneBonusMessage=`(-2 attacker raise)`;
    } else {
      if (sizebonus==0) {
        distance=1;        
      } else if (sizebonus>0) {
        distance=2;
      } 
      message += `<p>The ${target.name} is pushed ${distance} square(s).</p>`;
    }
    
    if( targetProneResult<4 ) {      
      if (coreRules) {
        message += `<p>The ${target.name} rolled ${targetProneResult} ${proneBonusMessage} and is knocked @Compendium[swade-core-rules.swade-rules.JhBfyamFYWMA4T93]{Prone}.</p>`;        
      } else {        
        message += `<p>The ${target.name} rolled ${targetProneResult} ${proneBonusMessage} and is knocked prone.</p>`;
      }               
    } else {
      message += `<p>The ${target.name} rolled ${targetProneResult} ${proneBonusMessage} and was not knocked prone.</p>`;
    } 
    
  } else {
    if (sizebonus==-1) {
      message += `<p>${attacker.name} is too small to push ${target.name}.</p>`;
    } else {
      message += `<p>${attacker.name} failed.</p>`;      
    }
  }  
 
  // send message
  let chatData = {
    content: message
  };  
  ChatMessage.create(chatData, {});  
  if (sizebonus!=-1) {
    let criticalFailureMessage = `<p><b style="color:red">CRITICAL FAILURE</b></p>`;   
    if (!attackerCriticalFailure) {criticalFailureMessage =``;}   
    //rolls3D[0].toMessage({flavor: `<h3 style="color:red">${attacker.name}</h3>${criticalFailureMessage}`});
    
    criticalFailureMessage = `<p><b style="color:red">CRITICAL FAILURE</b></p>`;   
    if (!targetCriticalFailure) {criticalFailureMessage =``;}  
    //rolls3D[1].toMessage({flavor: `<h3 style="color:red">${target.name}</h3>${criticalFailureMessage}`});  
    //prone
    if ( (attackerResult>=targetResult) ) { // success
      criticalFailureMessage = `<p><b style="color:red">CRITICAL FAILURE</b></p>`;   
      if (!targetProneCriticalFailure) {criticalFailureMessage =``;}  
      //rolls3D[2].toMessage({flavor: `<h3 style="color:red">${target.name}</h3>${criticalFailureMessage}`});      
    }
  }
}

// ======================
function howBigAmI(attacker, target) {
  let actorSize = attacker.actor.data.data.stats.size;
  let targetSize = target.actor.data.data.stats.size;
  if (actorSize == targetSize) {
    return 0;
  } else { 
    if ( targetSize>(actorSize+2) ) {      
      return -1;
    } else if (actorSize>targetSize) {
      return 2;
    } else if (targetSize>actorSize) {
      return 0;
    }
  }
}

// COMMONS v0.2
function rollSkill(myActor, skill) { 
  let actorSkill = myActor.actor.data.items.find(i => (i.name.toLowerCase().includes(skill.toLowerCase()) ) );
  let diceExpression;
  if (actorSkill) { // healing
    let actorSkillMod = actorSkill.data.data.die.modifier;
    if(!actorSkillMod) { actorSkillMod = 0; }
    if (isWildCard(myActor)) {
      diceExpression = '{1d'+actorSkill.data.data.die.sides + 'x+' + actorSkillMod + ',1d6x}';
    } else {
      diceExpression = '1d'+actorSkill.data.data.die.sides + 'x+' + actorSkillMod;
    }    
  } else { // untrained
    if (isWildCard(myActor)) {
      diceExpression = '{1d4x-2,1d6x}';
    } else {
      diceExpression = '1d4x-2';
    }
  }
  return new Roll(diceExpression).roll({ async : false });  
}

function rollAttribute(myActor, attribute) {
  let diceExpression;
  attribute=attribute.toLowerCase();
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


function isWildCard(token) {  
  return token.actor.data.data.wildcard;
}

function isCritical(rolled) {
  let trait = rolled.terms[0].rolls[0].terms[0].results[0].result;  
  let wild = rolled.terms[0].rolls[1].terms[0].results[0].result;  
  return (trait==1 && wild==1);
}
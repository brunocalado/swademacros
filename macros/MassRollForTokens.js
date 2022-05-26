const version = 'v1.3';
const sm = game.modules.get('swademacros')?.api.sm;
const icon = 'icons/sundries/gaming/dice-pair-white-green.webp';

var personas = canvas.tokens.controlled;
if (personas.length <= 0) {
  simpleDialog();
} else {
  tokenDialog();
}

function tokenDialog() {
  let template = ``;
  template += `<div style="background:#00b0ff;color:white;padding:3px">There are tokens selected. To ignore tokens and choose rolled dice, click the Choose Dice button</div>`;
 
  template += `<br><p>Trait: <select id="caract">`;
  template += `<optgroup label="Attributes">`;
  template += `<option value="Agility">Agility</option>`;
  template += `<option value="Smarts">Smarts</option>`;
  template += `<option value="Spirit">Spirit</option>`;
  template += `<option value="Strength">Strength</option>`;
  template += `<option value="Vigor">Vigor</option>`;
  template += `</optgroup>`;
  template += `<optgroup label="Skills">`;
  for (let i = 0; i < personas.length; i++) {
    let skills = personas[i].actor.items.filter((el) => el.type == "skill");
    let skillList = [];
    for (let j = 0; j < skills.length; j++) {

      if (!skillList.includes(skills[j].name)) {
        template += `<option value="` + skills[j].name + `">` + skills[j].name + `</option>`;
      }
      skillList.push(skills[j].name);
    }
  }
  template += `</optgroup>`;
  template += `</select></p>`;

  
  template += `
    <br>
    <table>
    <tbody>
    <tr>
    <td style="text-align: center;">Modifier: <input type="text" id="modificador" value="" style="width:50px" /></td>
    <td>&nbsp;</td>
    <td style="text-align: center;">Target Number: <input type="text" id="targetnum" value="4" style="width:50px" /></td>
    <td>&nbsp;</td>
    <td style="text-align: center;"><input type="checkbox" id="secret" style="margin:0;vertical-align:middle" /> Secret</label></td>
    </tr>
    </tbody>
    </table>  
  `;

  new Dialog({
    title: 'Token Roll',
    content: template,
    buttons: {
      ok: {
        label: `Roll`,
        callback: function(html) {
          applyFormOptionsToken(html);
        }
      },      
      cancel: {
        label: `Choose Dice`,
        callback: function(html) {
          simpleDialog();
        }
      }
    }
  }).render(true);

}


function simpleDialog() {
  let template = ``;
  if (personas.length <= 0) {
    template += `<div style="background:#00b0ff;color:white;padding:3px">No tokens selected. </div>`;
  }
  template += `
    <br>
    <table>
    <tbody>
    <tr>
    <td>
      <p>Dice: <select id="dice">
        <option value="d4">d4</option>
        <option value="d6">d6</option>
        <option value="d8">d8</option>
        <option value="d10">d10</option>
        <option value="d12">d12</option>
      </select></p>
    </td>
    <td><label style="font-size:16px"><input type="checkbox" id="wild" value="1" checked style="margin:0;vertical-align:middle" /> Wild Card</label></td>
    <td><label style="font-size:16px"><input type="checkbox" id="secret" value="false" style="margin:0;vertical-align:middle" /> Secret</label></td>    
    </tr>
    </tbody>
    </table>  
  <br>`;
  
  template += `
    <table>
    <tbody>
    <tr">
    <td style="text-align: center;border:1px;">Modifier:<br><input type="number" id="modificador" value="" style="width:50px" /></td>
    <td style="text-align: center;border:1px;">Target Number:<br><input type="number" id="targetnum" value="4" style="width:50px" /></td>
    <td style="text-align: center;border:1px;">Roll:<br><input type="number" id="repetir" value="1" style="width:50px" /> time(s)</td>
    </tr>
    </tbody>
    </table>  
  `;

  new Dialog({
    title: 'Simple Roll',
    content: template,
    buttons: {
      ok: {
        label: `Roll`,
        callback: function(html) {
          applyFormOptionsSimpleRoll(html);
        }
      }
    }
  }).render(true);
}


function applyFormOptionsToken(html) {
  let caractName = html.find("#caract")[0].value;
  let targetNumber = parseInt(html.find("#targetnum")[0].value);
  let modificador = Number(html.find("#modificador")[0].value);
  let isSecret=html.find("#secret")[0].checked;
  
  let contentText = ``;


  let atributes = {
    'Agility': 'agility',
    'Smarts': 'smarts',
    'Spirit': 'spirit',
    'Vigor': 'vigor',
    'Strength': 'strength'
  };

  for (let i = 0; i < personas.length; i++) {

    let isWCard = personas[i].actor.data.data.wildcard;
    let dice;
    let wilddice = 'd6';
    let caractmod = 0;
    let modStr = '';

    let addCaracName = ``;

    if (atributes[caractName] !== undefined) {
      let attkey = atributes[caractName];
      dice = 'd' + personas[i].actor.data.data.attributes[attkey].die.sides;
      if (isWCard) {
        wilddice = 'd' + personas[i].actor.data.data.attributes[attkey]["wild-die"].sides;
      }

      caractmod = Number(personas[i].actor.data.data.attributes[attkey].die.modifier);

    } else {
      /// is skill
      let skill = personas[i].actor.items.filter((el) => el.type == "skill" && el.name == caractName)[0];
      if (skill !== undefined) {
        dice = 'd' + skill.data.data.die.sides;
        if (isWCard) {
          wilddice = 'd' + skill.data.data["wild-die"].sides;
        }
        caractmod = Number(skill.data.data.die.modifier);

      } else {
        dice = 'd4';
        caractmod = caractmod - 2;
        addCaracName = ` (no skill -2)`;
      }
    }

    if (modificador != 0) {
      if (modificador > 0) {
        modStr += '+';
      }

      modStr += String(modificador);
    }

    let modificadorFinal = modificador + caractmod;

    contentText += `<strong style="font-size:16px">` + personas[i].actor.name + `</strong>`;

    contentText += '<div style="color:#4b4a44;font-size:12px">' + caractName + addCaracName + modStr + ' | TN:' + targetNumber + '</div>';

    contentText += resultInfo(dice, targetNumber, modificadorFinal, isWCard, wilddice);


  }

  styledChatMessage(contentText,isSecret); // CHECK!
}


function applyFormOptionsSimpleRoll(html) {
  let dice = html.find("#dice")[0].value;
  let isWCard = html.find("#wild")[0].checked;
  let isSecret=html.find("#secret")[0].checked;
  let targetNumber = parseInt(html.find("#targetnum")[0].value);
  let repeat = parseInt(html.find("#repetir")[0].value);
  let modificador = Number(html.find("#modificador")[0].value);
  let contentText = ``;
  let flavor = dice;


  if (modificador) {

    let modificadorStr = String(modificador);
    if (modificador > 0) {
      modificadorStr = '+' + modificadorStr;
    }
    flavor += modificadorStr;

  }

  if (isWCard) {
    flavor += ` (WC)`
  }

  if (repeat > 1) {
    flavor += ' x' + repeat;
  }

  flavor += ' | TN:' + String(targetNumber);


  for (let i = 1; i <= repeat; i++) {
    contentText += resultInfo(dice, targetNumber, modificador, isWCard);
  }

  styledChatMessage(contentText,isSecret, flavor);
  
}

function resultInfo(mainDie, targetNumber, modifier = 0, isWCard = true, wilddie = 'd6') {
  let mainDieResult = new Roll('1' + mainDie + 'x=').roll({
    async: false
  }).total;
  let wilddieResult = new Roll('1' + wilddie + 'x=').roll({
    async: false
  }).total;
  let textColor = 'grey';
  let mainDieColor = '#666';
  let wilddieColor = '#666';
  let tag = 'Failure';
  let criticalFailure = false;
  let showWildDie = false;
  let raise = false;
  let contentText = ``;
  let finalMainDieResult;
  let finalWilddieResult;
  let finalResult;

  if (mainDieResult == 1) {
    mainDieColor = 'red';
  }

  if (wilddieResult == 1) {
    wilddieColor = 'red';
  }

  if (isWCard) {
    showWildDie = true;
  }

  if (mainDieResult == 1 && wilddieResult == 1) {
    tag = 'Critical Failure';
    textColor = 'red';

    if (!isWCard) {
      showWildDie = true;
    }

    criticalFailure = true;
    finalMainDieResult = 1;
    finalWilddieResult = 1;
    finalResult = 1;

  }

  if (!criticalFailure) {
    finalMainDieResult = mainDieResult + modifier;
    finalWilddieResult = 0;
    finalResult = finalMainDieResult;

    if (isWCard) {
      finalWilddieResult = wilddieResult + modifier;
      finalResult = Math.max(finalWilddieResult, finalMainDieResult);
    }


    if (finalMainDieResult >= targetNumber || finalWilddieResult >= targetNumber) {
      
      let targetNumberRaise = targetNumber + 4

      if (finalMainDieResult >= targetNumber) {
        mainDieColor = 'green';
        if (finalMainDieResult >= targetNumberRaise) {
          raise = true;
          mainDieColor = 'purple';
        }
      }

      if (finalWilddieResult >= targetNumber) {
        wilddieColor = 'green';
        if (finalWilddieResult >= targetNumberRaise) {
          raise = true;
          wilddieColor = 'purple';
        }
      }

      if (raise) {
        //    raiseStr=1;

        let raiseNum=Math.floor(finalResult/4) - 1;
            let wordAmp='Raise';
            if (raiseNum>1){
                wordAmp='Raises';
            } 
            tag='Success! and '+raiseNum+' '+wordAmp;
            textColor='purple';

      } else {
        tag = 'Success!';
        textColor = 'green';
      }
    }
  }

  contentText += `<div class="dice-tooltip"><div class="dice-rolls"><ol class="dice-rolls"><li class="roll die ` + mainDie + `" style="color:` + mainDieColor + `">` + finalMainDieResult + `</li>`;

  if (showWildDie) {
    contentText += `<li class="roll die ` + wilddie + `" style="color:` + wilddieColor + `">` + finalWilddieResult + `</li>`
  }

  contentText += `<li style="line-height:24px;float:left;font-size:16px;color:` + textColor + `;font-weight:bold;margin-left:10px">` + tag + `</li>`;
  contentText += `</ol></div></div>`;

  return contentText;
}

async function styledChatMessage(message, isSecret, flavor='') {
  let finalMessage = `<h2><img style="border: 0;vertical-align:middle;" src=${icon} width="28" height="28"> Mass Roll</h2>`;
  finalMessage+=message;
  let chatData = {
    flavor: flavor,
    speaker: null,
    content: finalMessage
  };
  if(isSecret){
    chatData['whisper'] = [game.user.id];
    chatData['type'] =  CONST.CHAT_MESSAGE_TYPES.WHISPER;
  }  
  ChatMessage.create(chatData, {});
}

/*
devs: lipefl#5425 Reef#9327 Laslo#5711
*/
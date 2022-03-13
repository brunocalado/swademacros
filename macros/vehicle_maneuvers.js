/* vehicle_maneuvers
icon: icons/tools/nautical/steering-wheel.webp
*/

let tokenD;
const version = 'v1.1';
const chatimage = "icons/tools/nautical/steering-wheel.webp";
let coreRules = false;
let rules = '@Compendium[swade-core-rules.swade-rules.nB1vsvPTn5jSRG6v]{Chases and Vehicles}';
if (game.modules.get("swade-core-rules")?.active) { coreRules = true; }

main();
  
async function main(){
  let maneuversOptions = ['CHANGE POSITION','EVADE', 'FLEE', 'FORCE', 'HOLD STEADY', 'RAM'];
  let maneuversOptionsLabels = ['CHANGE POSITION - (Action or Free Action)','EVADE - (Action or Free Action)', 'FLEE - (Action)', 'FORCE - (Action)', 'HOLD STEADY - (Free Action)', 'RAM - (Action)'];

  let maneuversOptionsList = ``;
  for (let i = 0; i < maneuversOptions.length; i++) {
    maneuversOptionsList += `<option value="${maneuversOptions[i]}">${maneuversOptionsLabels[i]}</option>`;
  }
  
  new Dialog({
    title: `Vehicle Maneuvers - ${version}`,
    content: `
    <h2>Maneuvers</h2>
    <p>
      <select id="maneuversOptionsID" type="text" style="width: 100%; box-sizing: border-box;border: none; text-align: center;">
        ${maneuversOptionsList}
      </select>      
    </p>
    <br>
    `,
    buttons: {
      roll: {
        label: "Do It!",
        callback: (html) => {
          showManeuversOptions(html);
        }
      }, 
      cancel: {
        label: "Cancel"
      }
    }
  }).render(true)
}

async function showManeuversOptions(html) {
  let maneuver = html.find("#maneuversOptionsID")[0].value;  
  let message='';
  
  if (coreRules) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${rules}</h2></div>`;
  } else {
    message = `<div><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Chases and Vehicles</h2><div>`;
  }
  
  message += checkManeuver(maneuver);
  
  let chatData = {
    content: message
  };  
  ChatMessage.create(chatData, {});  
}

function checkManeuver(maneuver) {
  let message = '';
  if (maneuver=='CHANGE POSITION') {
    message+=`<h3><b>${maneuver} - (Action or Free Action)</b><h3>`;
    message+=`<p>Success allows him to move up or down one Chase Card, and up to two with a raise.</p>`;
    message+=`<ul><li><b>Action:</b> +2</li>`;
    message+=`<li><b>Speed Bonus:</b> +1 faster / +2 twice as fast</li>`;
    message+=`<li><b>Dropping Back:</b> a character may drop “back” one or two Chase Cards without making a maneuvering roll.</li></ul>`;
  } else if (maneuver=='EVADE') {
    message+=`<h3><b>${maneuver} - (Action or Free Action)</b><h3>`;
    message+=`<p>Melee and ranged attacks will suffer a −2 penalty until the start of that vehicle’s next turn. <b>The character and any occupants on his mount or in his vehicle also take the penalty</b></p>`;
    message+=`<ul><li><b>Action:</b> If the character performs this maneuver as an action, the penalty increases to −4 (in both directions).</li>`;
  } else if (maneuver=='FLEE') {
    message+=`<h3><b>${maneuver} - (Action)</b><h3>`;
    message+=`<p>A character or vehicle may escape the chase if there are at least four Chase Cards between himself and the closest foe. If so, he makes a maneuvering roll at −4 and escapes if successful.</p><p>The penalty is reduced to −2 if there are at least five cards between them, and 0 if there are six or more.</p>`;
  } else if (maneuver=='FORCE') {
    message+=`<h3><b>${maneuver} - (Action)</b><h3>`;
    message+=`<p>The attacker attempts to force a rival away from his vehicle or into an obstacle.</p>`;
    message+=`<p>To do so, both must be on the same Chase Card and make <b>opposed maneuvering rolls</b>. If the attacker wins, he Bumps his foe.</p>`;
    message+=`<ul><li><b>Raise:</b> raise is treated as if the defender rolled a Critical Failure on a maneuvering roll</li>`;
  } else if (maneuver=='HOLD STEADY') {
    message+=`<h3><b>${maneuver} - (Free Action)</b><h3>`;
    message+=`<p>They <b>ignore the Unstable Platform and Running penalties</b>, but <b>attacks against the vehicle and all its occupants are made at +2</b> until the beginning of their next turn (this does not stack with Vulnerable).</p>`;
  } else if (maneuver=='RAM') {
    message+=`<h3><b>${maneuver} - (Action)</b><h3>`;
    message+=`<p>An attacker can Ram a defender if they’re on the same Chase Card by making opposed maneuvering rolls. If successful, both participants cause the following damage to the other:</p>`;
    message+=`<ul><li><b>Action:</b> +2</li>`;
    message+=`<li><b>Scale:</b> The base damage is based on Scale: Small ([[/r 1d6x]]), Normal ([[/r 2d6x]]), Large ([[/r 3d6x]]), Huge ([[/r 4d6x]]), and Gargantuan ([[/r 5d6x]]).</li>`;
    message+=`<li><b>Raise:</b> +[[/r 1d6x]] bonus damage for the attacker if he got a raise on his maneuvering roll.</li>`;
    message+=`<li><b>Toughness:</b> +[[/r 1d6x]] if the vehicle’s Toughness is higher than his foe’s; +2d6 if Toughness is twice as high.</li>`;
    message+=`<li><b>Speed:</b> +[[/r 1d6]] to both sides if the attacker’s Top Speed is between 60 and 120 mph; +[[/r 2d6x]] if it’s over 120 mph.</li></ul>`;
  }
  
  return message;
}





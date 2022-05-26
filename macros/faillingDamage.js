const version = 'v1.2';
const sm = game.modules.get('swademacros')?.api.sm;
const chatimage = 'icons/skills/wounds/bone-broken-marrow-red.webp';
/*
Failing Damage
*/

/* rules
select 1d6+1 
max 10d6 + 10
Soft grounds (foot):

OUTPUT water:

Falling damage is 1d6 + 1 per 2″ (4 yards), to a maximum of 10d6 + 10.

Snow: Particularly soft ground, such as very deep snow, acts as a cushion. Every foot of soft snow reduces damage 1 point.

Water: A successful Athletics roll halves damage into reasonably deep water at heights of 10″ (20 yards) or less. A raise negates the damage entirely. Those who fall into water from heights greater than 20 yards take damage as if they’d hit solid earth.
*/

let tokens = [...new Set([...canvas.tokens.controlled, ...game.user.targets])]; //use deduplication to get rid of those which are both, selected and targeted:

if (tokens.length === 0) {
  return ui.notifications.error("Select or target one or more tokens first.");
}

let messageContent = `<h2><img style="border: 0;vertical-align:middle;" src=${this.data.img} width="28" height="28"> Damage from Falling</h2>`;
const options = `<option value="na">n/a</option><option value="success">Success</option><option value="raise">Raise</option>`;

main();

// ---------------
//roll the damage the character takes based on the distance:
async function roll_damage(token, fallingDepth, snowDepth, waterSuccess) {
  let halvedDepth = Math.min( Math.ceil(fallingDepth / 2), 10); //damage per 2" - max 10
  let damageFormula = `(${halvedDepth}d6)+${halvedDepth}`;
  let rollDamage = await new Roll(`${damageFormula}`).roll({ async : false });
  await rollDamage.toMessage(); // 3d dice
  let damage = rollDamage.total;
  let waterRaise = false;
  if (snowDepth > 0) {
    damage = damage - snowDepth;
  } else if (waterSuccess != "na") {
    if (waterSuccess === "success") {
      damage = Math.ceil(damage / 2)
    } else if (waterSuccess === "raise") {
      waterRaise = true;
      damage = 0;
    }
  }
  if (waterRaise === false) {
    messageContent += `<p><b>${token.data.name}</b> falls <b>${fallingDepth}&rdquo;</b> and takes <strong style="color:red">${damage}</strong> damage.</p>`
  } else if (waterRaise === true) {
    messageContent += `<p><b>${token.data.name}</b> falls <b>${fallingDepth}&rdquo;</b> but dives into the water gracefully, taking no damage in the process.</p>`
  }
  await calculate_damage(token, damage);
}

async function calculate_damage(token, damage) {
  const toughness = token.document._actor.data.data.stats.toughness.value;
  const isShaken = token.document._actor.data.data.status.isShaken;
  const raises = Math.floor((damage - toughness) / 4);
  const isHardy = token.document._actor.data.items.find(function(item) {
    return ((item.name.toLowerCase() === "hardy") && item.type === "ability");
  });
  if (toughness > damage) {
    messageContent += `<ul><li>No harm.</li></ul>`;
  } else if (toughness <= damage) {
    if (isShaken === false && raises <= 0) {
      messageContent += `<ul><li>Shaken.</li></ul>`;
    } else if (isShaken === false && raises >= 1) {
      messageContent += `<ul><li>Shaken and ${raises} Wounds.</li></ul>`;
      sm.applyWounds(token, raises);
    } else if (isShaken === true && raises <= 1) {
      if (!isHardy || raises === 1) {
        messageContent += `<ul><li>1 Wounds.</li></ul>`;
        sm.applyWounds(token, 1);
      } else if (isHardy) {
        messageContent += `<ul><li>No harm.</li></ul>`;
      }
    } else if (isShaken === true && raises >= 1) {
      let wounds = raises - 1;
      messageContent += `<ul><li>${wounds} Wounds.</li></ul>`;
      sm.applyWounds(token, wounds);
    }
  }
}

async function main() {
  let content =
    `<div>
        <details>
          <summary>Fall Calculation (click to expand)</summary>
          <p>Provide a falling depth in &rdquo; (squares on the tabletop; each equals 2 yards &cong; 2 meters &cong; 10 feet).</p>
          <p>Snow and other soft ground reduces the damage. Provide a depth in feet (&cong; 30 cm) if applicable or leave it at 0 if not.</p>
          <p>Falling in water allows an Athletics roll. If applicable provide the degree of success. If not applicable or if the roll was failed, leave it at "n/a".</p>
        </details> <br>
        <p style="font-size:12px"><b>Tip:</b> One click the text and use mouse scroll to change the number.</p>
        <div style="display: grid; grid-template-columns: 5fr 1.2fr 1fr 1.3fr; grid-gap: 2px;">
        <strong style="text-align: left;">Token</strong>
        <strong style="text-align: center;">Depth</strong>
        <strong style="text-align: center;">Snow</strong>
        <strong style="text-align: center;">Athletics</strong>
    `;
  for (let token of tokens) {
    content += `
        <p>
          <img style="border: 0; text-align: left;" src="${token.data.img}" width="25" height="25" /> 
          <span style="vertical-align: super; text-align: left;">${token.data.name}</span>
        </p>
        <input style="text-align: center;" id="fallingDepth-${token.id}" style="flex: 1;" type="number" value="0" />
        <input style="text-align: center;" id="snowDepth-${token.id}" style="flex: 1;" type="number" value="0" />
        <select style="text-align: center;" id="water-${token.id}">${options}</select>
    `;
  };
  content += `
        </div>
    </div><br>`;
  new Dialog({
    title: "Falling Damage Calculator",
    content: content,
    buttons: {
      roll: {
        label: "Roll",
        callback: async (html) => {
          for (let token of tokens) {
            //Getting results from checkboxes and making the rolls.
            let fallingDepth = Number(html.find(`#fallingDepth-${token.id}`)[0].value);
            let snowDepth = Number(html.find(`#snowDepth-${token.id}`)[0].value);
            let waterSuccess = html.find(`#water-${token.id}`)[0].value;
            if (waterSuccess != "na" && snowDepth != 0) {
              return ui.notifications.error(`You can't combine water and snow.`)
            }
            await roll_damage(token, fallingDepth, snowDepth, waterSuccess);
          }
/* TODO chat button   
          sm.addEventListenerOnHtmlElement("#ChatButtonMacrosForSWADE", 'click', (e) => {    
            let tokenD = canvas.tokens.controlled[0];
            let rolled = tokenD.actor.rollAttribute('spirit');    // ROLL SPIRIT
          });  
          messageContent+=`<button style="background:#d10000;color:white" id="ChatButtonMacrosForSWADE">Soak</button>`;            
*/          
          ChatMessage.create({
            speaker: ChatMessage.getSpeaker({
              token: actor
            }),
            content: messageContent
          });
        }
      },
      cancel: {
        label: "Cancel"
      }
    }
  }).render(true)
}


          
  
  

  

/*****
 * Falling Damage Macro.
 * This macro automatically calculates falling damage for all selected tokens.
 * It is capable of factoring in water and snow/soft surfaces as per the core rules.
 * v. 1.0.0 by SalieriC#8263, CSS of the dialogue by Kyane von Schnitzel#8654
 * (Do not remove credits, even if editing.)
 *****/
 
 
const version = 'v1.3';

/* Unstun

source: 
icon: icons/magic/symbols/symbol-lightning-bolt.webp
*/
const chatimage = "icons/magic/symbols/symbol-lightning-bolt.webp";
let tokenD=canvas.tokens.controlled[0];
const myTitle = `<img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Stunned`;
let message1 = ``;
let message2 = ``;

if (tokenD===undefined) {
  ui.notifications.error("Please select a token."); // No Token is Selected
} else {
  main();
}

async function main() {
  if (tokenD.actor.data.data.status.isStunned === true) {
    rollUnstun();
  } else if (tokenD) {
    let message = ``;
    
    if (tokenD.actor.data.data.status.isStunned === false) {
      await tokenD.actor.update({ "data.status.isStunned": true });
    };

    if ( sm.isModuleOn("combat-utility-belt") ) {
      await game.cub.addCondition("Prone");
    };
    await tokenD.actor.update({ "data.status.isDistracted": true });
    await tokenD.actor.update({ "data.status.isVulnerable": true });
     
    sm.styledChatMessage(myTitle, `<b>${tokenD.name}</b> is <b>stunned</b> now!`, '');        
  }
}

async function rollUnstun() {
  let message = ``;
  let rolled = await tokenD.actor.rollAttribute('vigor');
  
  if (rolled!=null) {  
    let rollWithEdge = rolled.total;

    message1 = `<b>${tokenD.name}</b> rolled <b>${rollWithEdge}</b>.`;
    
    // Checking for a Critical Failure.
    if ( sm.isCritical(rolled) ) {
      ui.notifications.notify("You've rolled a Critical Failure!");
      message2 = `<b>${tokenD.name}</b> rolled a <b style="color: red;">Critical Failure!</b>!`;    
    } else {
      if (rollWithEdge > 3 && rollWithEdge <= 7) {
        message2 = `<b>${tokenD.name}</b> is no longer <b>Stunned</b>.`;
        message2 += `<ul><li>Vulnerable until end of next turn.</li>`;
        message2 += `<li>Distracted until end of this turn.</li></ul>`;
        await tokenD.actor.update({ "data.status.isVulnerable": true });
        await tokenD.actor.update({ "data.status.isStunned": false });
      } else if (rollWithEdge >= 8) {
        message2 = `<b>${tokenD.name}</b> is no longer <b>Stunned</b> and looses <b>Vulnerable/Distracted</b>.`;
        await tokenD.actor.update({ "data.status.isDistracted": false });
        await tokenD.actor.update({ "data.status.isStunned": false });
        await tokenD.actor.update({ "data.status.isVulnerable": false });
      } else {
        message2 = `<b>${tokenD.name}</b> remains <b>Stunned</b>.`;
        if ( (sm.checkBennies(tokenD)>0) ) {
          sm.addEventListenerOnHtmlElement("#swademacrosbutton", 'click', async (e) => {    
            sm.macroRun('Unstun');
            sm.styledChatMessage(myTitle, `<b>${tokenD.name}</b> spent a benny to roll again.`);
          });            
          message2+=`<button style="background:#d10000;color:white" id="swademacrosbutton">Use Benny</button>`;     
        }
      }
    }
    sm.styledChatMessage(myTitle, message1, message2);
  }
}


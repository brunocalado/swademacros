const version = 'v1.4';

/* Unstun

source: 
icon: icons/magic/symbols/symbol-lightning-bolt.webp
*/
const chatimage = "icons/magic/symbols/symbol-lightning-bolt.webp";
let tokenD=canvas.tokens.controlled[0];
const myTitle = `Stunned`;
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
     
    sm.styledChatMessageSimple(myTitle, `<b>${tokenD.name}</b> is <b>stunned</b> now!`, chatimage);        
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
          const buttonID = Math.floor(Math.random(0.1)*1000000000);
          sm.addEventListenerOnHtmlElement("#swadeMacrosUnstunButton_"+buttonID, 'click', async (e) => {                
            sm.spendBenny(tokenD);
            sm.styledChatMessageSimple(myTitle, `<b>${tokenD.name}</b> spent a benny to roll again.`);
            sm.macroRun('Unstun');
          });            
          message2+=`<button style="background:#d10000;color:white" id="swadeMacrosUnstunButton_${buttonID}">Use Benny</button>`;     
        }
      }
    }
    sm.styledChatMessageSimple(myTitle, message1 + `<br>` + message2, chatimage);
  }
}


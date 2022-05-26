const version = 'v2.0';
const sm = game.modules.get('swademacros')?.api.sm;

/* Unshaken

source: 
icon: icons/magic/control/fear-fright-white.webp
*/

const chatimage = "icons/magic/control/fear-fright-white.webp";
let tokenD=canvas.tokens.controlled[0];
const myTitle = `Shaken`;
let message1 = ``;
let message2 = ``;
  
if (tokenD===undefined) {
  ui.notifications.error("Please select a token."); // No Token is Selected
} else {
  main();
} 

async function main() {
  if (tokenD.actor.data.data.status.isShaken === true) {
    rollUnshake();
  } else if (tokenD) {
    let message=``;
    await tokenD.actor.update({ "data.status.isShaken": true });
    sm.styledChatMessageSimple(myTitle, `<b">${tokenD.name}</b> is <b>shaken</b> now!`, chatimage);       
  }  
}

async function rollUnshake() {
  let rolled = await tokenD.actor.rollAttribute('spirit');    // ROLL SPIRIT
  
  if (rolled!=null) {  
    let rollWithEdge = rolled.total;
   
    message1 = `<b>${tokenD.name}</b> rolled <b>${rollWithEdge}</b>.`;
    
    // Checking for a Critical Failure.
    if ( sm.isCritical(rolled) ) {
      ui.notifications.notify("You've rolled a Critical Failure!");
      message2 = `<b>${tokenD.name}</b> rolled a <b>Critical Failure!</b>!`;    
    } else {
      if (rollWithEdge <= 3) {
        message2 = `${tokenD.name} will remain Shaken.`;
        const buttonID = Math.floor(Math.random(0.1)*1000000000);
        if ( (sm.checkBennies(tokenD)>0) ) {
          sm.addEventListenerOnHtmlElement("#swadeMacrosUnshakenButton_"+buttonID, 'click', async (e) => {    
            sm.spendBenny(tokenD);
            await tokenD.actor.update({ "data.status.isShaken": false });              
            sm.styledChatMessageSimple(myTitle, `<b>${tokenD.name}</b> spent a benny and is no longer <b>shaken</b>.`, chatimage);
          });            
          message2+=`<button style="background:#d10000;color:white" id="swadeMacrosUnshakenButton_${buttonID}">Use Benny</button>`;  
        }
      } else if (rollWithEdge >= 4) {
        await tokenD.actor.update({ "data.status.isShaken": false });
        message2 = `<b>${tokenD.name}</b> is no longer <b>shaken</b> and may act normally.`;
      }
    }
    sm.styledChatMessageSimple(myTitle, message1 + `<br>` + message2, chatimage);
  }
}

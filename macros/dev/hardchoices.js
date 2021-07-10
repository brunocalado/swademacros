
const version = 'v1.0';
const chatimage = "icons/magic/life/cross-area-circle-green-white.webp";
let coreRules = false;
if (game.modules.get("swade-core-rules")?.active) { coreRules = true; }
// 

main();

async function main(){
    let user = game.users.get(game.userId);
    let actor = game.actors.get(user.data.character);

    if(!actor){
        ui.notifications.error("Cannot use this macro if player hasn't been assigned an actor");
        return;
    }

    actor.spendBenny();

    if (coreRules) {
      message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> @Compendium[swade-core-rules.swade-rules.nF3w2ly84awwGf3z]{Hard Choices}</h2></div>`;
    } else {
      message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Hard Choices</h2>`;
    }

    message += `${actor.data.name} (${user.data.name}) gave a benny to the Gamemaster`;

    ChatMessage.create({ content: message });

    sm.bennieChangeGM(1);
}
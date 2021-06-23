// --- Seperate Macro for players ---

main();

async function main(){
    let user = game.users.get(game.userId);
    let actor = game.actors.get(user.data.character);

    if(!actor){
        ui.notifications.warn("Cannot use this macro if player hasn't been assigned an actor");
        return;
    }

    actor.spendBenny();
    ui.notifications.notify(`${actor.data.name} (${user.data.name}) gave a benny to the Gamemaster`)
    game.macros.get("rwzEgqjC30sm6ALM").execute();
}

// --- Seperate Macro only for the GM ---

main() //Execute Macro as GM

async function main(){
    let gm = game.users.find(u => u.data.name == "Gamemaster");
    await gm.update({"flags.swade.bennies": gm.data.flags.swade.bennies + 1});
}
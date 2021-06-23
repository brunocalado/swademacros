

// Requires at least 1 target
if (canvas.tokens.controlled[0]===undefined || Array.from(game.user.targets)[0]===undefined){
  ui.notifications.warn("You must select a token and target another one!");    
} else {
  let target=Array.from(game.user.targets)[0]; // token will not be count
  let attacker=canvas.tokens.controlled[0];  
  messageToTheChat(attacker, target);
}


//token.combatant.update({initiative: token.combatant.data.initiative + 3})
let token=canvas.tokens.controlled[0];  
token.combatant.rollInitiative();


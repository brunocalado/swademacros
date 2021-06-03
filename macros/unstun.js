const version = 'v1.0';
const chatimage = "icons/magic/control/fear-fright-mask-orange.webp";

/* Unstun

source: 
icon: 
*/

let bennies;
let bv;
let elanBonus=null;
let elan;
let token;

if (canvas.tokens.controlled[0]===undefined) { // No Token is Selected
  ui.notifications.error("Please select a token."); // No Token is Selected
} else {
  token = canvas.tokens.controlled[0];
  main();
}

async function main() {
  //Checking for Elan
  elan = token.actor.data.items.find(function (item) {
    return item.name.toLowerCase() === "elan" && item.type === "edge";
  });

  if (token.actor.data.data.status.isStunned === true) { //unstun
    rollUnstun();
  } else {
    await token.actor.update({ "data.status.isStunned": true, "data.status.isDistracted": true, "data.status.isVulnerable": true });
    console.log('------------');
    canvas.tokens.controlled[0].actor.data.status
    //await token.actor.update({ "data.status.isDistracted": true });
    //await token.actor.update({ "data.status.isVulnerable": true });
    // PRONE!!!???
  }  
}

async function rollUnstun() {

  const edgeNames = ['combat reflexes'];
  const actorAlias = speaker.alias;
  // ROLL VIGOR AND CHECK COMBAT REFLEXES
  let spirit = '{1d' + token.actor.data.data.attributes.vigor.die.sides + 'x+' + token.actor.data.data.attributes.vigor.die.modifier+',1d6x}';  
  let vigorDice = new Roll(spirit).roll({ async : false });  
  let traitdie = vigorDice.terms[0].results[0].result;
  let wilddie = vigorDice.terms[0].results[1].result;  
  let vigorRolled=Math.max(traitdie, wilddie);

  const edges = token.actor.data.items.filter(function (item) {
    return edgeNames.includes(item.name.toLowerCase()) && (item.type === "edge" || item.type === "ability");
  });
  let rollWithEdge = vigorRolled;
  let edgeText = "";
  for (let edge of edges) {
    rollWithEdge += 2;
    edgeText += `<br/><i>+ ${edge.name}</i>`;
  }

  // Apply +2 if Elan is present and if it is a reroll.
  if (typeof elanBonus === "number") {
    rollWithEdge += 2;
    edgeText = edgeText + `<br/><i>+ Elan</i>.`;
  }

  let chatData = `<div><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28">Stun</h2>`;    
  chatData += `${actorAlias} rolled <b style="color:blue"> ${rollWithEdge} </b>`;
    
  // Checking for a Critical Failure.
  if ( vigorDice.terms[0].results[0].result==1 && vigorDice.terms[0].results[1].result==1 ) {
    ui.notifications.notify("You've rolled a Critical Failure!");
    chatData += `${actorAlias} rolled a <span style="font-size:150% color:red"> Critical Failure! </span>`;
  } else {
    if (rollWithEdge > 3 && rollWithEdge <= 7) {
      chatData += ` and is no longer Stunned but remains Vulnerable until end of next turn.`;
      await token.actor.update({ "data.status.isVulnerable": true });
      await token.actor.update({ "data.status.isStunned": false });
      useBenny();
    } else if (rollWithEdge >= 8) {
      chatData += `, is no longer Stunned and looses Vulnerable after the turn.`;
      await token.actor.update({ "data.status.isDistracted": false });
      await token.actor.update({ "data.status.isStunned": false });
      await token.actor.update({ "data.status.isVulnerable": false });
      // PRONE ??!?!?! NOT IN THE SYSTEM
    } else {
      chatData += ` and remains Stunned.`;
      useBenny();
    }
    chatData += ` ${edgeText}`;
  }
  ChatMessage.create({ content: chatData });
  vigorDice.toMessage();
}

function useBenny() {
  new Dialog({
    title: 'Spend a Benny?',
    content: `Do you want to spend a Benny to reroll? (You have ${bv} Bennies left.)`,
    buttons: {
      one: {
        label: "Yes.",
        callback: (html) => {          
          if (checkBennies()>0) {
            spendBenny();
            if (!!elan) {
              elanBonus = 2;
            }
            rollUnstun();
          }
        }
      },
      two: {
        label: "No.",
        callback: (html) => { return; },
      }
    },
    default: "one"
  }).render(true)
}



// Check for Bennies
function checkBennies() {
  bennies = token.actor.data.data.bennies.value;

  // Non GM token has <1 bennie OR GM user AND selected token has <1 benny
  if ((!game.user.isGM && bennies < 1) || (game.user.isGM && bennies < 1 && game.user.getFlag("swade", "bennies") < 1)) {
    ui.notifications.error("You have no more bennies left.");
  }
  if (game.user.isGM) {
    bv = bennies + game.user.getFlag("swade", "bennies");
  }
  else {
    bv = bennies;
  }
  return bv;
}

// Spend Benny function
async function spendBenny() {
  bennies = token.actor.data.data.bennies.value;
  //Subtract the spend, use GM benny if user is GM and token has no more bennies left or spend token benny if user is player and/or token has bennies left.
  if (game.user.isGM && bennies < 1) {
    game.user.setFlag("swade", "bennies", game.user.getFlag("swade", "bennies") - 1)
  } else {
    token.actor.update({
      "data.bennies.value": bennies - 1,
    })
  }

  //Show the Benny Flip
  if (game.dice3d) {
    game.dice3d.showForRoll(new Roll("1dB").roll({ async : false }), game.user, true, null, false);
  }

  //Chat Message to let the everyone know a benny was spent
  ChatMessage.create({
    user: game.user.id,
    content: `<p><img style="border: none;" src="${chatimage}"" width="25" height="25" /> ${game.user.name} spent a Benny for ${token.name}.</p>`,
  });
}
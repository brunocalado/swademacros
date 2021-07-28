const tableName = 'Action Cards';
const version = 'v1.0';
const chatimage = "icons/sundries/books/book-backed-blue-gold.webp";
const ruleLink = '@Compendium[swade-core-rules.swade-rules.fSBsmuTK9aYdGBsE]{Interludes}';
let coreRules = sm.isModuleOn("swade-core-rules");

/*

TODO 
- 
source: 
icon: 
*/

if (canvas.tokens.controlled[0]===undefined) {
  ui.notifications.error("Please select one or more tokens."); // No Token is Selected
} else {
  main();
}

async function main() {
  let messageHeader = ``;
  const players_list = await game.users.contents;
  let characters = canvas.tokens.controlled.filter(e => e.actor.data.type === 'character' && e.actor.hasPlayerOwner);
  
  if (coreRules) {
    messageHeader = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${ruleLink}</h2></div><ul>`;
  } else {
    messageHeader = `<div><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Interludes</h2><div><ul>`;
  }

  await game.tables.find((t) => t.data.name == tableName).reset(); // reset table

  for (var i = 0; i < characters.length; i++) {
    let message = messageHeader;
    const tableResult = await drawFromTable(tableName);
    message+=`<h3><b style="color:red">${characters[i].name}</b> got <b>${tableResult}!</b></h3>`
    if( tableResult.includes('Joker') ) {
      message+=`<p>You drew a Joker! Everyone will get an extra Benny and you can choose the suit and category!</p>`
    } 
    message+=interludeOutcome(tableResult);
    
    const selected_player = await players_list.find((t) => t.data.character == characters[i].actor.id);
    //players_list.find((t) => t.data.character == canvas.tokens.controlled[0].actor.id);
    sm.debug(characters[i].actor.id)
    sm.debug(selected_player.data.character)
    let chatData = {
      user: game.user.id,    
      content: message,
      whisper : [selected_player.id],
      speaker: ChatMessage.getSpeaker( { actor: characters[i].actor } )      
    };   

    ChatMessage.create(chatData, {});     
  } // end for
  
}

async function drawFromTable(tableName) {
  let tableResult = (
    await game.tables
      .find((t) => t.data.name == tableName)
      .drawMany(1, { displayChat: false })
  ).results;
  
  return tableResult[0].data.text;
}

function interludeOutcome(tableResult) {
  const spadesText=`<ul>
  <li><p><b>Downtime:</b> The character spends time alone in quiet contemplation. What does she do?</p></li>
<li><p><b>Backstory:</b> A great victory or personal triumph.</p></li>
<li><p><b>Trek:</b> A difficult obstacle the group negotiated along the way.</p></li></ul>`;
  const heartsText=`<ul>
  <li><p><b>Downtime:</b> The hero practices a skill. What is it?</p></li>
<li><p><b>Backstory:</b> A tale of the hero’s greatest love—lost, found, present, or waiting on her back home.</p></li>
<li><p><b>Trek:</b> How the party endured a trying hardship on the journey.</p></li></ul>`;
  const diamondsText=`<ul>
  <li><p><b>Downtime:</b> The character studies or works on an object of some sort. What is it?</p></li>
<li><p><b>Backstory:</b> Something your hero wants or already has. It might be a material possession, recognition, a political goal, or even a trip he wishes to take to some amazing destination.</p></li>
<li><p><b>Trek:</b> How the group found something that helped them along the way, such as an oasis, minor treasure, ammo, food, friendly locals, etc.</p></li></ul>`;
  const clubsText=`<ul>
  <li><p><b>Downtime:</b> Your hero broods or is angry about something. What is it, and how does she misbehave?</p></li>
<li><p><b>Backstory:</b> A tale of misfortune from your hero’s past, perhaps revealing something of his Hindrances or a dark secret.</p></li>
<li><p><b>Trek:</b> A hardship the party overcame on their trip: the tragic death of a favored Extra, spoiled or lost supplies, a mechanical breakdown, abysmal weather, and so on.</p></li></ul>`;
  let jokerText = `
    <style scoped>
      .custom-sizing-spacing {
          margin: 1em 0;
      }
    </style>
    <details class="custom-sizing-spacing">
      <summary>Spades</summary>
        ${spadesText}
    </details>
    <details class="custom-sizing-spacing">
      <summary>Hearts</summary>
        ${heartsText}
    </details>
    <details class="custom-sizing-spacing">
      <summary>Diamonds</summary>
        ${diamondsText}
    </details>
    <details class="custom-sizing-spacing">
      <summary>Clubs</summary>
        ${clubsText}
    </details>    
  `  ;

  if( tableResult.includes('Spades') ) {
    return spadesText;
  } else if( tableResult.includes('Hearts') ) {
    return heartsText;
  } else if( tableResult.includes('Diamonds') ) {
    return diamondsText;
  } else if( tableResult.includes('Clubs') ) {    
    return clubsText;
  } else { // joker
    //   send joker to every one
    return jokerText;
  }
}

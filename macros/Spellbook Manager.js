const spellBookName1 = 'Attack';
const spellBookName2 = 'Support';
const spellBookName3 = 'Defense';
const spellBookName4 = 'Everything';

const spellBookTag1 = '#spellBook1';
const spellBookTag2 = '#spellBook2';
const spellBookTag3 = '#spellBook3';
const spellBookTag4 = '#spellBook4';

/*
Spellbook Manager
-

icon: icons/sundries/books/book-embossed-spiral-purple-white.webp
*/

let tokenD;
const version = 'v0.1';
const chatimage = "icons/sundries/books/book-embossed-spiral-purple-white.webp";

if (canvas.tokens.controlled[0]===undefined) {
  ui.notifications.error("Please, select a token."); // No Token is Selected
} else {
  tokenD = canvas.tokens.controlled[0];
  main();
}

function main() {
  let dialogText = ``;
  
  dialogButtons = {
    one: {
      label: spellBookName1,
      callback: (html) => {
        activeSpellbook(spellBookTag1);
      }
    },
    two: {
      label: spellBookName2,
      callback: (html) => {
        activeSpellbook(spellBookTag2);
      }
    },
    three: {
      label: spellBookName3,
      callback: (html) => {
        activeSpellbook(spellBookTag3);
      }
    },
    four: {
      label: spellBookName4,
      callback: (html) => {
        equipAllItems();
      }
    }
  }
  

  // Main Dialogue
  new Dialog({
    title: 'Spellbook Switcher',
    content: dialogText,
    buttons: dialogButtons,
    default: "one",
  }).render(true);

}

// MACRO FUNCTIONS
async function activeSpellbook(spellbookTag) {
  let tmp=``;
  let message=``;

  await equipAllItems(false);
  tmp = await equipItems(spellbookTag, true);

  if (tmp!='') {
    message+=`<p>${tokenD.actor.name} equipped:</p>`;
    message+=`<ul>${tmp}</ul>`;    
    
    let chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      content: message
    };  
    ChatMessage.create(chatData, {});
  }

}

async function equipItems(spellbookTag, itemStatus=true) {
  let message =``;
  let itemSet = await tokenD.actor.items.filter( e => e.data.data.description?.includes(spellbookTag));
  if (itemSet.length>0) {
    for (var item of itemSet) {
      await item.update({"data.equipped" : itemStatus});
      message+= `<li>${item.name}</li>`;
    }    
  } else {
    message=``;
  }
  return message;
}

async function equipAllItems(itemStatus=true) {
  let tokenD = canvas.tokens.controlled[0];  //debug
  let itemSet = await tokenD.actor.items.filter( e => e.type==='power');
  if (itemSet.length>0) {
    for (var item of itemSet) {
      await item.update({"data.equipped" : itemStatus});
    }    
  } 
}

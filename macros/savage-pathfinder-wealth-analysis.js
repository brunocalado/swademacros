/* Wealth Analysis for Savage Pathfinder 
source: 
icon: icons/commodities/currency/coins-plain-stack-gold-yellow.webp

TODO
read selectc tokens
read coins quantity
read all items, get their value 
show token and value
out: gold: xxx / items: xxx / total: xxx
*/

const version = 'v0.1';
const sm = game.modules.get('swademacros')?.api.sm;
const icon = "icons/commodities/currency/coins-plain-stack-gold-yellow.webp";

if ( canvas.tokens.controlled[0]===undefined ) {
  ui.notifications.error("Please, select or target a token."); // No Token is Selected
} else {
  main();
}

function main() {
  let tokens = canvas.tokens.controlled;

  /* Show actual xp points*/
  let currentHeroPointsList = '';
  for (var tokenD of tokens) {
    const character = game.actors.get(tokenD.actor.id);
    var copper = getCoinsTotal(getCoins(character, 'Copper') );
    var silver = getCoinsTotal(getCoins(character, 'Silver') );
    var gold = getCoinsTotal(getCoins(character, 'Gold') );
    var platinum = getCoinsTotal(getCoins(character, 'Platinum') );
    var totalCoins = Math.floor(silver/10) + Math.floor(copper/100) + Math.floor(platinum*10) + gold;
    var totalGearValue = getGearPrice(character);
    currentHeroPointsList += `<p><b>${character.name}</b> <b>(${character.data.data.advances.rank})</b></p>`;
    currentHeroPointsList += `<ul>
    <li>Total: <b>${totalCoins+totalGearValue}</b></li>
    <li>Gold (coins): <b>${totalCoins}</b></li>
    <li>Goods and Magic Items: <b>${totalGearValue}</b></li>    
    </ul>
    `;
  }    

  let template = ` 
  <h2>Core (p16)</h2>
  <p><b>Seasoned heroes have 10,000</b> gold pieces worth of goods and magic items, <b>Veteran</b> characters get <b>40,000</b>, <b>Heroic 150,000</b>, and <b>Legendary 500,000</b>.</p>
  
  <h2>Current Wealth</h2>
  <ul>
    ${currentHeroPointsList}
  </ul>
  `;
  
  new Dialog({
    title: ` Wealth Analysis for Savage Pathfinder - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "OK",
        callback: async (html) => {
        }
      }
    },
  }).render(true);
}


// -------------------------------------------------------
// Functions
function getCoins(character, coinType) {
  let coins=0;
  if (coinType=='Copper') {
    coins = character.items.filter(e => e.name==='Copper');  
  } else if (coinType=='Silver') {
    coins = character.items.filter(e => e.name==='Silver');   
  } else if (coinType=='Gold') {
    coins = character.items.filter(e => e.name==='Gold');   
  } else if (coinType=='Platinum') {
    coins = character.items.filter(e => e.name==='Platinum');      
  }  
  return coins;
}

function getCoinsTotal(coins) {
  if (coins.length>0) {
    const sum = coins.reduce((total, item) => total += item.data.data.quantity, 0);
    return sum;
  } else {
    return 0;
  }  
}

function getGearPrice(character) {
  let gear;
  gear = character.items.filter(e => e.type==='gear' || e.type==='weapon' || e.type==='armor' || e.type==='shield');  
  
  const sum = gear.reduce((total, item) => total += item.data.data.price, 0);
  
  return sum;
}
const version = 'v1.2';
const chatimage = "https://raw.githubusercontent.com/brunocalado/mestre-digital/master/Foundry%20VTT/Macros/Savage%20Worlds/icons/clock.webp";

/* Deviation p99 SWADE
If a blast template misses, it deviates 1d6″
for thrown weapons (such as grenades) and
2d6″ for fired projectiles. Multiply by 2 if the
attack was made at Medium Range, 3 if Long,
and 4 for Extreme.

Next roll a d12 and read it like a clock
facing to determine the direction the missile
deviates. A weapon can never deviate more
than half the distance to the original target
(that keeps it from going behind the thrower).

source: https://raw.githubusercontent.com/brunocalado/mestre-digital/master/Foundry%20VTT/Macros/Savage%20Worlds/Deviation.js
icon: icons/weapons/thrown/dynamite-simple-brown.webp
*/

let coreRules = false;
if (game.modules.get("swade-core-rules")?.active) { coreRules = true; }
const chaticon = 'icons/weapons/thrown/dynamite-simple-brown.webp';

getRequirements();

function getRequirements() {
  let template = `
  <h2>Weapon Type</h2>
  <table style="width:100%">
  <tr>
    <td><input type="radio" id="thrown" name="weapontype" value="thrown"><label for="thrown">Thrown weapon</label></td>
    <td><input type="radio" id="projectile" name="weapontype" value="projectile" checked="checked><label for="projectile">Projectile</label></td>    
  </tr>
  </table>  
  <h2>Range</h2>
  <table style="width:100%">
  <tr>
    <td><input type="radio" id="short" name="range" value="short" checked="checked><label for="short">Short</label></td>
    <td><input type="radio" id="medium" name="range" value="medium"><label for="medium">Medium</label></td>    
    <td><input type="radio" id="long" name="range" value="long"><label for="long">Long</label></td>    
    <td><input type="radio" id="extreme" name="range" value="extreme"><label for="extreme">Extreme</label></td>    
  </tr>
  </table>    
  <h2>Blast Size</h2>
  <table style="width:100%">
  <tr>
    <td><input type="radio" id="smallblast" name="blastsize" value="smallblast"><label for="smallblast">Small</label></td>
    <td><input type="radio" id="mediumblast" name="blastsize" value="mediumblast" checked="checked><label for="mediumblast">Medium</label></td>    
    <td><input type="radio" id="largeblast" name="blastsize" value="largeblast"><label for="largeblast">Large</label></td>    
  </tr>
  </table>   
  `;
  new Dialog({
    title: "Deviation",
    content: template,
    buttons: {
      ok: {
        label: "Go!",
        callback: async (html) => {
          rollForIt(html);
        },
      }
    },
  }).render(true);
}

async function rollForIt(html) {
  const weapontype=html.find('input[name="weapontype"]:checked').val();
  const range=html.find('input[name="range"]:checked').val();
  const blastsize=html.find('input[name="blastsize"]:checked').val();
  
  if (weapontype=='thrown') {
    await diceRoll('1d6', range, blastsize);
  } else {
    await diceRoll('2d6', range, blastsize);
  }
}

async function diceRoll(die, range, blastsize) {
  const rangeMultiplier = rangeCheck(range);
  const rollDirection = (await new Roll("1d12").evaluate({async: true}));
  const direction = rollDirection.total;
  const rollDistance = (await new Roll(die).evaluate({async: true}));
  const distance = (rollDistance.total)*rangeMultiplier;

  let message = `<div><h2><img style="vertical-align:middle" src=${chaticon} width="28" height="28">Deviation</h2>`;    
  if (coreRules === true) {
    message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chaticon} width="28" height="28"> @Compendium[swade-core-rules.swade-rules.xxEcWExtn36PPxg0]{Deviation}</h2>`;
  }  
  
  message += `<p>Move the blast <b>${distance}"</b> to <b style="color:red">${direction}</b> O'Clock.</p>`;
  if (directionCheck(direction)) {
    message += `<p><b style="color:red">A weapon can never deviate more than half the distance to the original target (that keeps it from going behind the thrower).</b></p>`;
  }
  message += `<p style="text-align:center"><img style="vertical-align:middle" src=${chatimage} width="200" height="200"><p></div>`;
  
  let chatData = {
    content: message
  };
  ChatMessage.create(chatData, {});  
  let tempChatData = {
    content: message
  };     
  await rollDirection.toMessage();
  await rollDistance.toMessage();
  
  const callbacks = {
    pre: async (templateData, updates) => {
      const offset = await getOffset(direction, distance);
      return templateData.update({x: templateData.x + offset.x, y: templateData.y + offset.y})
    },
    post: async (template, tokenD) => { 
      await createTemplate(tokenD, blastsize);
      tokenD.delete();
    }
  }

  await actorExists(); 
  warpgate.spawn("explosive", {}, callbacks);  
}

function rangeCheck(range) {
  if (range=='short') {
    return 1;
  } else if (range=='medium') {
    return 2;
  } else if (range=='long') {
    return 3;
  } else if (range=='extreme') {
    return 4;
  }
}

function directionCheck(direction) {
  if (direction==4 || direction==5 || direction==6 || direction==7 || direction==8) {
    return true
  } else {
    return false
  } 
}

async function getOffset(direction, distance) {
  const gridSize = canvas.grid.size;
  const finalDistance = gridSize*distance;

  switch (direction) {
    case 1:
    case 2:
      return {x: finalDistance, y: -finalDistance};
    case 3:
      return {x: finalDistance, y: 0};
    case 4:
    case 5:
      return {x: finalDistance, y:finalDistance};
    case 6:
      return {x: 0, y: finalDistance};
    case 7:
    case 8:
      return {x: -finalDistance, y:finalDistance};
    case 9:
      return {x: -finalDistance, y:0};
    case 10:
    case 11:
      return {x: -finalDistance, y:-finalDistance};
    case 12:
      return {x: 0, y:-finalDistance};
  }
}

// smallblast mediumblast largeblast
async function createTemplate(tokenD, templateSize) {  
  let size;
  switch (templateSize) {
    case 'smallblast':
      size = 1;
      break;
    case 'mediumblast':
      size = 2;
      break;
    case 'largeblast':
      size = 3;
      break;
  }

  await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
    t: "circle",
    user: game.user.id,
    x: tokenD.data.x + canvas.grid.size/2,
    y: tokenD.data.y + canvas.grid.size/2,
    direction: 0,
    distance: size,
    borderColor: "#FF0000",
    //fillColor: "#FF3366",
  }]);
}

// This function will check the actor directory for an actor.
async function actorExists() {
  
  if(game.actors.getName("explosive")===undefined) {    
    let data = {
      name: 'explosive',
      type: "npc",
      img: "icons/weapons/thrown/dynamite-simple-brown.webp",    
      data: {},
      token: {},
      items: [],
      flags: {},
      data: {}
    }

    const instantBomb = await Actor.create(data);
  }
}

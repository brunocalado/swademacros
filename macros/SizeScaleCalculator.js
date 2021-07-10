const version = 'v1.9';
const chatimage = "icons/tools/hand/scale-balances-merchant-brown.webp";
const debugFlag = false;

/* Size Scale p106 SWADE

source: https://raw.githubusercontent.com/brunocalado/mestre-digital/master/Foundry%20VTT/Macros/Savage%20Worlds/SizeScaleCalculator.js
icon: icons/tools/hand/scale-balances-merchant-brown.webp
    // v. 1.0.0 - Original code by brunocalado, modified by SalieriC#8263.
*/

let tokenActor = canvas.tokens.controlled[0];
let tokenTarget = Array.from(game.user.targets)[0];
let coreRules = false;
if (game.modules.get("swade-core-rules")?.active) { coreRules = true; }
const rules = '@Compendium[swade-core-rules.swade-rules.mbP0fwcquD98QtwX]{Size & Scale}';

if (tokenActor === undefined || tokenTarget === undefined) {
    ui.notifications.warn("You must select a token and target another one!");
} else {
  const actorSwat = token.actor.data.items.find(function (item) {
      return ((item.name.toLowerCase() === "swat") && item.type === "ability");
  });
  const targetSwat = tokenTarget.actor.data.items.find(function (item) {
      return ((item.name.toLowerCase() === "swat") && item.type === "ability");
  });
  rollForIt();


  function rollForIt() {
      let actorSize = tokenActor.actor.data.data.stats.size;
      let targetSize = tokenTarget.actor.data.data.stats.size;
      let actorModifier = sizeToScaleModifier(actorSize);
      let targetModifier = sizeToScaleModifier(targetSize);
      let modifier = getToHitScaleModifier(actorSize, targetSize);

      let message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Size & Scale Calculator</h2>`;
      if (coreRules === true) {
          message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${rules} Calculator</h2></div>`;
      }
      
      message += `<ul><li><b>${tokenActor.name}:</b> Size = ${actorSize} / Modifier = ${actorModifier}</li>`;
      message += `<li><b>${tokenTarget.name}:</b> Size = ${targetSize} / Modifier = ${targetModifier}</li></ul>`;
      message += `<h3>Result:</h3>`;
      if (modifier != 0) {
        message += `<ul><li>${tokenActor.name} has <b style="color:red">${modifier}</b> to attack ${tokenTarget.name}`;

        if (actorSwat) {
          message += ` and has Swat*.</li>`;
        } else { message += `.</li>` }

        message += `<li>${tokenTarget.name} has <b style="color:red">${getToHitScaleModifier(targetSize, actorSize)}</b> to attack ${tokenActor.name}`;

        if (targetSwat) {
          message += ` and has Swat*.</li></ul>`;
        } else { message += `.</li></ul>` }

        if ((actorSwat && targetSwat) || (actorSwat || targetSwat)) {
          if (coreRules === true) {
            message += `<p>*<b>@Compendium[swade-core-rules.swade-rules.q5sk5hEw6TED0FOU]{Swat}:</b> Ignore up to 4 points of penalties from Scale for the specified action(s).</p>`;
          } else {
            message += `<p>*<b>Swat:</b> Ignore up to 4 points of penalties from Scale for the specified action(s).</p>`;
          }
        }
      } else {
        message += `<p><b>There is no modifier.</b> They have the same Scale.</p>`;
      }

      // send message
      let chatData = {
        content: message
      };
      ChatMessage.create(chatData, {});
  }

  function getToHitScaleModifier(actorSize, targetSize) { // Match from page 106 core
    let actorScaleModifier = sizeToScaleModifier(actorSize);
    let targetScaleModifier = sizeToScaleModifier(targetSize);
    return targetScaleModifier - actorScaleModifier;
  } 
/*
  function sizeCalculator(actorSize, targetSize) { // Mach from page 106 core
    let actorModifier = sizeToModifier(actorSize);
    let targetModifier = sizeToModifier(targetSize);

    let diff;
    if (actorSize == targetSize) {
      return 0;
    } else {
      // When creatures of different Scales attack each other, the smaller creature adds the difference between its Scale and its target to its attacks. A Tiny fairy (−6 Scale modifier), for example, adds +10 to hurl a bolt at a Huge dragon (+4).
      if (actorSize < targetSize) {
        diff = Math.abs(actorModifier) + Math.abs(targetModifier);
        return diff;
      // The larger creature subtracts the difference from its attacks. A Very Small eagle (−4) subtracts 2 from its Fighting totals when attacking a Tiny fairy (−6).
      } else { // actorSize > targetSize
        diff = Math.abs(actorModifier) - Math.abs(targetModifier);
        return diff;
      }
    }
  }
*/
  function sizeToScaleModifier(size) { //p179 swade core
    if (size == -4) {
        return -6;
    } else if (size == -3) {
        return -4;
    } else if (size == -2) {
        return -2;
    } else if (size >= -1 && size <= 3) {
        return 0;
    } else if (size >= 4 && size <= 7) {
        return 2;
    } else if (size >= 8 && size <= 11) {
        return 4;
    } else if (size >= 12 && size <= 20) {
        return 6;
    } else {
      ui.notifications.error("Size out of scale. Core p179");
    }
  }

}

function debugSize() {
  let actorSize;
  let targetSize;
  let output;
  
  console.log("===========================");
  console.log("Size/Scale Debug");

  // actorSize > targetSize
  actorSize = -3; // Very Small eagle
  targetSize = -4; // Tiny fairy
  output = sizeCalculator(actorSize, targetSize);
  console.log("Very Small eagle " + actorSize + " attacks Tiny fairy " + targetSize + ': ' + output);

  actorSize = 8; // Dragon
  targetSize = 5; // White rhino
  output = sizeCalculator(actorSize, targetSize);
  console.log("Dragon " + actorSize + " attacks White rhino " + targetSize + ': ' + output);
   
  // targetSize > actorSize
  actorSize = -4; // Tiny fairy
  targetSize = 8; // dragon
  output = sizeCalculator(actorSize, targetSize);
  console.log("Tiny fairy " + actorSize + " attacks dragon " + targetSize + ': ' + output);

  console.log("===========================");  
}

if (debugFlag) {
  debugSize();
}


/* delete this stuff
      console.log('---------------');
      console.log('actorModifier: ' + actorModifier);
      console.log('targetModifier: ' + targetModifier);
      console.log('actorSize: ' + actorSize);
      console.log('targetSize: ' + targetSize);
      console.log('diff: ' + diff);
      console.log('---------------');     
*/
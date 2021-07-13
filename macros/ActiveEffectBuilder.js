
/* AE Builder
*/

const version = 'v1.0';
const icon = "icons/magic/symbols/rune-sigil-green.webp";

if ( canvas.tokens.controlled[0]===undefined && Array.from(game.user.targets)[0]===undefined ) {
  ui.notifications.error("Please, select or target a token."); // No Token is Selected
} else {
  main();
}

function main() {
  
  let dialogue_content = `
    <form>
      <div class="form-group">
        <label>Name:</label>
        <input id="aename" name="aename" type="text" value="effect 1">
      </div>    
      <div class="form-group">
      
        <label for="aeType">Effect:</label>
        <input list="aeTypes" id="aeType" name="aeType">
        <datalist id="aeTypes">
          <option value="data.stats.toughness.armor">Armor</option>          
          <option value="data.stats.size">Size</option>
          <option value="data.stats.speed.value">Pace</option>
          <option value="data.stats.parry.value">Parry</option>
          <option value="data.stats.toughness.value">Toughness</option>
          
          <option value="data.status.isShaken">Shaken</option>
          <option value="data.status.isDistracted">Distracted</option>
          <option value="data.status.isVulnerable">Vulnerable</option>
          <option value="data.status.isStunned">Stunned</option>
          <option value="data.status.isEntangled">Entangled</option>
          <option value="data.status.isBound">Bound</option>
          
        </datalist>  
      </div>
      <div class="form-group">
        <label>Value:</label>
        <input id="aevalue" name="aevalue" type="text" value="2">
      </div>   
    </form>
`;

  let applyChanges = false;
  let dialogButtons = {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: `Apply Changes`,
      callback: (html) => {
        applyActiveEffect(html);
      }
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: `Cancel Changes`
    }   
  }

  // Main Dialogue    
  new Dialog({
    title: `Active Effect Builder - ${version}`,
    content: dialogue_content,
    buttons: dialogButtons,
    default: "yes",
  }).render(true);
}

async function applyActiveEffect(html) {
  let aename = html.find('[name="aename"]')[0].value;
  let aekey = html.find("#aeType")[0].value;
  let aevalue = html.find('[name="aevalue"]')[0].value;

  let aemode = keyToMode(aekey);
  aevalue = keyToValue(aekey, aevalue);

  let myActiveEffect = {icon: icon, label: aename, changes: [
    {key:aekey, value: aevalue, mode: aemode }
  ]};

  for (let tokenD of canvas.tokens.controlled) {
    let activeEffectClass = getDocumentClass("ActiveEffect");
    const output = await activeEffectClass.create(myActiveEffect, {parent:tokenD.actor});
  }

  for (let tokenD of Array.from(game.user.targets)) {
    let activeEffectClass = getDocumentClass("ActiveEffect");
    const output = await activeEffectClass.create(myActiveEffect, {parent:tokenD.actor});
  }
  
}

function keyToMode(mykey) {
  let aeTypeAdd = ['data.stats.toughness.armor', 'data.stats.size', 'data.stats.speed.value', 'data.stats.parry.value', 'data.stats.toughness.value' ];
  let aeTypeOverride = [ 'data.status.isShaken', 'data.status.isDistracted', 'data.status.isVulnerable', 'data.status.isStunned', 'data.status.isEntangled', 'data.status.isBound' ];

  if ( aeTypeAdd.includes(mykey) ) {
    return CONST.ACTIVE_EFFECT_MODES.ADD;
  } else if ( aeTypeOverride.includes(mykey) ) {
    return CONST.ACTIVE_EFFECT_MODES.OVERRIDE;
  } else {
    ui.notifications.error("Error");
  }  
}

function keyToValue(mykey, myvalue) {
  let aeTypeAdd = ['data.stats.toughness.armor', 'data.stats.size', 'data.stats.speed.value', 'data.stats.parry.value', 'data.stats.toughness.value' ];
  let aeTypeOverride = [ 'data.status.isShaken', 'data.status.isDistracted', 'data.status.isVulnerable', 'data.status.isStunned', 'data.status.isEntangled', 'data.status.isBound' ];

  if ( aeTypeAdd.includes(mykey) ) {
    return myvalue;
  } else if ( aeTypeOverride.includes(mykey) ) {
    return true;
  } else {
    ui.notifications.error("Error");
  }  
}
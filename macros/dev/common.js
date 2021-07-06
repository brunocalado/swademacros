// COMMONS // v0.3
function haveEdge(edge) { // v0.3
  return item.name.toLowerCase() === edge.toLowerCase() && item.type === "edge";
}

function rollAttribute(myActor, attribute) {
  let diceExpression;
  attribute=attribute.toLowerCase();
  if (attribute=='agility') {
    diceExpression = '{1d' + myActor.actor.data.data.attributes.agility.die.sides + 'x+' + myActor.actor.data.data.attributes.agility.die.modifier+',1d6x}';      
  } else if (attribute=='smarts') {
    diceExpression = '{1d' + myActor.actor.data.data.attributes.smarts.die.sides + 'x+' + myActor.actor.data.data.attributes.smarts.die.modifier+',1d6x}';      
  } else if (attribute=='spirit') {
    diceExpression = '{1d' + myActor.actor.data.data.attributes.spirit.die.sides + 'x+' + myActor.actor.data.data.attributes.spirit.die.modifier+',1d6x}';      
  } else if (attribute=='strength') {
    diceExpression = '{1d' + myActor.actor.data.data.attributes.strength.die.sides + 'x+' + myActor.actor.data.data.attributes.strength.die.modifier+',1d6x}';      
  } else if (attribute=='vigor') {
    diceExpression = '{1d' + myActor.actor.data.data.attributes.vigor.die.sides + 'x+' + myActor.actor.data.data.attributes.vigor.die.modifier+',1d6x}';      
  }
  return new Roll(diceExpression).roll({ async : false });  
}

function rollSkill(myActor, skill) { 
  let actorSkill = myActor.actor.data.items.find(i => (i.name.toLowerCase().includes(skill.toLowerCase()) ) );
  let diceExpression;
  if (actorSkill) { // healing
    let actorSkillMod = actorSkill.data.data.die.modifier;
    if(!actorSkillMod) { actorSkillMod = 0; }
    if (isWildCard(myActor)) {
      diceExpression = '{1d'+actorSkill.data.data.die.sides + 'x+' + actorSkillMod + ',1d6x}';
    } else {
      diceExpression = '1d'+actorSkill.data.data.die.sides + 'x+' + actorSkillMod;
    }    
  } else { // untrained
    if (isWildCard(myActor)) {
      diceExpression = '{1d4x-2,1d6x}';
    } else {
      diceExpression = '1d4x-2';
    }
  }
  return new Roll(diceExpression).roll({ async : false });  
}

async function applyWounds(token, val) {
  let currentWounds = getWounds(token);
  if ( (currentWounds+val)>3 ) {
    await token.actor.update({ "data.wounds.value": 3 });
  } else if ( (currentWounds+val)<0 ) {
    await token.actor.update({ "data.wounds.value": 0 });
  } else {
    await token.actor.update({ "data.wounds.value": (currentWounds+val) });
  }
}

function getWounds(token) {
  return token.actor.data.data.wounds.value;
}

function isCritical(rolled) {
  let trait = rolled.terms[0].rolls[0].terms[0].results[0].result;  
  let wild = rolled.terms[0].rolls[1].terms[0].results[0].result;  
  return (trait==1 && wild==1);
}

function isWildCard(token) {  
  return token.actor.data.data.wildcard;
}












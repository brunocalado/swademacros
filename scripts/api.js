class sm {
  
  // rollAttribute(myActor, attribute)
  // myActor = token
  // attribute = agility, smarts, etc
  static rollAttribute(myActor, attribute) {
    let diceExpression;
    let wildDie = '';
    attribute=attribute.toLowerCase();
  
    if (this.isWildCard(myActor)) {
      wildDie = ',1d6x';
    }

    if (attribute=='agility') {
      diceExpression = '{1d' + myActor.actor.data.data.attributes.agility.die.sides + 'x+' + myActor.actor.data.data.attributes.agility.die.modifier + wildDie + '}';
    } else if (attribute=='smarts') {
      diceExpression = '{1d' + myActor.actor.data.data.attributes.smarts.die.sides + 'x+' + myActor.actor.data.data.attributes.smarts.die.modifier + wildDie + '}';
    } else if (attribute=='spirit') {
      diceExpression = '{1d' + myActor.actor.data.data.attributes.spirit.die.sides + 'x+' + myActor.actor.data.data.attributes.spirit.die.modifier + wildDie + '}';
    } else if (attribute=='strength') {
      diceExpression = '{1d' + myActor.actor.data.data.attributes.strength.die.sides + 'x+' + myActor.actor.data.data.attributes.strength.die.modifier + wildDie + '}';
    } else if (attribute=='vigor') {
      diceExpression = '{1d' + myActor.actor.data.data.attributes.vigor.die.sides + 'x+' + myActor.actor.data.data.attributes.vigor.die.modifier + wildDie + '}';
    }
    
    return new Roll(diceExpression).roll({ async : false });  
  }

  // rollSkill(myActor, skill)
  // myActor = token
  // attribute = notice, athletics, etc
  static rollSkill(myActor, skill) { 
    let actorSkill = myActor.actor.data.items.find(i => (i.name.toLowerCase().includes(skill.toLowerCase()) ) );
    let diceExpression;
    let wildDie = '';
    
    if (this.isWildCard(myActor)) {
      wildDie = ',1d6x';
    }
    
    if (actorSkill) { // ex.: healing
      let actorSkillMod = actorSkill.data.data.die.modifier;
      if(!actorSkillMod) { actorSkillMod = 0; }
      diceExpression = '{1d'+actorSkill.data.data.die.sides + 'x+' + actorSkillMod + wildDie + '}';
    } else { // untrained
      diceExpression = '{1d4x-2' + wildDie + '}';
    }
    return new Roll(diceExpression).roll({ async : false });  
  }

  // isWildCard(token)
  // token = token
  static isWildCard(token) {  
    return token.actor.data.data.wildcard;
  }

  static async applyWounds(token, val) {
    let currentWounds = this.getWounds(token);
    let maxWounds = this.getMaxWounds(token);
    
    if ( (currentWounds+val)>maxWounds ) {
      await token.actor.update({ "data.wounds.value": maxWounds });
    } else if ( (currentWounds+val)<0 ) {
      await token.actor.update({ "data.wounds.value": 0 });
    } else {
      await token.actor.update({ "data.wounds.value": (currentWounds+val) });
    }
  }

  static getWounds(token) {
    return token.actor.data.data.wounds.value;
  }

  static getMaxWounds(token) {
    return token.actor.data.data.wounds.max;
  }

  static isCritical(rolled) {
    let trait = rolled.terms[0].rolls[0].terms[0].results[0].result;  
    let wild = rolled.terms[0].rolls[1].terms[0].results[0].result;  
    return (trait==1 && wild==1);
  }

  static betterDice(rolled) {
    if ( rolled.terms[0].rolls.length>1 ) {
      let trait = rolled.terms[0].rolls[0].total;
      let wild = rolled.terms[0].rolls[1].total;
      return Math.max( trait, wild ) ;
    } else {
      return rolled.terms[0].rolls[0].total;
    }
  }

  // ---------------------------------------------------------------
  // ??
  static hasItem(itemName, itemType=['edge']) {
    return item.name.toLowerCase() === edge.toLowerCase() && item.type === "edge";
  }
  
  // ---------------------------------------------------------------
  // Helper
  static async macroRun(macroName) {  
    let pack = game.packs.get('swademacros.macros-for-swade');
    let macro = ( await pack.getDocuments() ).find(i => (i.data.name==macroName) );
    await macro.execute();    
  }
  
  // ---------------------------------------------------------------
  // Debug
  static debug(message) {
    console.log('-----------------------------');
    console.log(message);
    console.log('-----------------------------');
  }
  
}
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
  static async rollSkill(token, skill) {
    let actorSkill = token.actor.data.items.find(i => (i.name.toLowerCase().includes(skill.toLowerCase())) );
    let skillName; 
    if (!actorSkill) {
      actorSkill = token.actor.data.items.find(i => (i.name === 'Untrained' || i.name === 'Unskilled Attempt' ) );
    }
    skillName = actorSkill.name;
    return await game.swade.rollItemMacro(skillName);
  }


  // rollSkill(myActor, skill)
  // myActor = token
  // attribute = notice, athletics, etc
  static rollSkillFor(token, skill) { 
    let actorSkill = token.actor.data.items.find(i => (i.name.toLowerCase().includes(skill.toLowerCase()) ) );
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

  // SKill List
  static listSkills(token) {
    return token.actor.data.items.filter(i => (i.type === 'skill') ).map(i => (i.name));  
  }

  // ---------------------------------------------------------------
  // BENNY MAG
  // Spend Benny function
  static async spendBenny(tokenD) { // Spend Benny function
    let bennies = tokenD.actor.data.data.bennies.value;
    //Subtract the spend, use GM benny if user is GM and token has no more bennies left or spend token benny if user is player and/or token has bennies left.
    if (game.user.isGM && bennies < 1) {
      game.user.setFlag("swade", "bennies", game.user.getFlag("swade", "bennies") - 1)
    } else {
      tokenD.actor.update({
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
      content: `<p><b style="color:red">${game.user.name}</b> spent a Benny for <b style="color:red">${tokenD.name}</b>.</p>`,
    });
  }

  static checkBennies(tokenD) { // Check for Bennies
    let bennies = tokenD.actor.data.data.bennies.value;

    // Non GM token has <1 bennie OR GM user AND selected token has <1 benny
    if ((!game.user.isGM && bennies < 1) || (game.user.isGM && bennies < 1 && game.user.getFlag("swade", "bennies") < 1)) {
      ui.notifications.error("You have no more bennies left.");
      return 0;
    } else if (game.user.isGM) {
      return bennies + game.user.getFlag("swade", "bennies");
    } else {
      return bennies;
    }
  }
  
  static async useBenny(tokenD) {
    let bennies = this.checkBennies(tokenD);
    if (bennies > 0) {
      new Dialog({
        title: 'Spend a Benny?',
        content: `Do you want to spend a Benny? (You have <b>${bennies}</b> Bennies left.)`,
        buttons: {
            one: {
              label: "Yes.",
              callback: (html) => {
                this.spendBenny(tokenD);
              }
            },
            two: {
              label: "No.",
              callback: (html) => {},
            }
          },
          default: "one"
        }).render(true)
    }
  }
    
  // ---------------------------------------------------------------
  // CRITICAL
  static isCritical(r) {
    return (this.isSame_bool(r.dice) && this.isSame_numb(r.dice) === 1);
  }    
  
  static isSame_bool(d = []) { // Functions to determine a critical failure. This one checks if all dice rolls are the same.
    return d.reduce((c, a, i) => {
      if (i === 0) return true;
      return c && a.total === d[i - 1].total;
    }, true);
  }
  
  static isSame_numb(d = []) { // Functions to determine a critical failure. This one checks what the number of the "same" was.
    return d.reduce((c, a, i) => {
      if (i === 0 || d[i - 1].total === a.total) return a.total;
      return null;
    }, 0);
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
  static async macroRun(macroName, compendiumName='swademacros.macros-for-swade') {  
    let pack = game.packs.get(compendiumName);
    let macro = ( await pack.getDocuments() ).find(i => (i.data.name==macroName) );
    await macro.execute();    
  }
  
  // ---------------------------------------------------------------
  // GENERAL
  static isModuleOn(moduleName) {    
    if (game.modules.get(moduleName)?.active) { return true; }
    else { return false; }
  }
   
  // ---------------------------------------------------------------
  // Debug
  static debug(message) {
    console.log('-----------------------------');
    console.log(message);
    console.log('-----------------------------');
  }
  
}
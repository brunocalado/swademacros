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
  static async rollSkill(tokenD, skill) {
    let actorSkill = tokenD.actor.data.items.filter(i => (i.type==='skill' )).find(i => (i.name.toLowerCase().includes(skill.toLowerCase())) );
    
    if (!actorSkill) {
      actorSkill = tokenD.actor.data.items.find(i => (i.name === 'Untrained' || i.name === 'Unskilled Attempt' ) );
    }
    return await tokenD.actor.rollSkill(actorSkill.id); //REPLACE ==> return await game.swade.rollItemMacro(skillName);   
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
  static isWildCard(tokenD) {  
    return tokenD.actor.data.data.wildcard;
  }
  
  // WOUNDS
  static async applyWounds(tokenD, val) {
    let currentWounds = this.getWounds(tokenD);
    let maxWounds = this.getMaxWounds(tokenD);
    
    if ( (currentWounds+val)>maxWounds ) {
      await tokenD.actor.update({ "data.wounds.value": maxWounds });
    } else if ( (currentWounds+val)<0 ) {
      await tokenD.actor.update({ "data.wounds.value": 0 });
    } else {
      await tokenD.actor.update({ "data.wounds.value": (currentWounds+val) });
    }
  }

  static getWounds(tokenD) {
    return tokenD.actor.data.data.wounds.value;
  }

  static getMaxWounds(tokenD) {
    return tokenD.actor.data.data.wounds.max;
  }

  // FATIGUE
  static async applyFatigue(tokenD, val) {
    let currentFatigue = this.getFatigue(tokenD);
    let maxFatigue = this.getMaxFatigue(tokenD);
    
    if ( (currentFatigue+val)>maxFatigue ) {
      await tokenD.actor.update({ "data.fatigue.value": maxFatigue });
    } else if ( (currentFatigue+val)<0 ) {
      await tokenD.actor.update({ "data.fatigue.value": 0 });
    } else {
      await tokenD.actor.update({ "data.fatigue.value": (currentFatigue+val) });
    }
  }

  static getFatigue(tokenD) {
    return tokenD.actor.data.data.fatigue.value;
  }

  static getMaxFatigue(tokenD) {
    return tokenD.actor.data.data.fatigue.max;
  }

  // SKill List
  static listSkills(tokenD) {
    return tokenD.actor.data.items.filter(i => (i.type === 'skill') ).map(i => (i.name));  
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
  
  static async useBenny(tokenD, inlineFunction=undefined) {
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
                if (inlineFunction!=undefined) {
                  inlineFunction(tokenD)
                }
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
  // Helper
  static async macroRun(macroName, compendiumName='swademacros.macros-for-swade') {  
    let pack = game.packs.get(compendiumName);
    let macro = ( await pack.getDocuments() ).find(i => (i.data.name==macroName) );
    await macro.execute();    
  }

  // ---------------------------------------------------------------
  // Tables
  static async drawFromCompendiumTable(compendiumName, tableName) {
    let list_compendium = await game.packs.filter(p=>p.documentName=='RollTable');      
    let inside = await list_compendium.filter( p=>p.metadata.label==compendiumName )[0].getDocuments();      
    let table = await inside.filter( p=>p.data['name']==tableName )[0];
    
    if (!table) {
      ui.notifications.error(`Table ${tableName} not found.`, {});
      return;
    }
    return await table.draw({rollMode: 'gmroll'});
  }

  // ---------------------------------------------------------------
  // Chat
  static async styledChatMessage(myTitle, message1, message2='') {
    let chatData = {
      speaker: null,
      content: `<label class="titulo" style="font-size:35px; color: #b02b2e;">${myTitle}</label>
      <br><label style="font-size: 15px">${message1}</label>
      <div style="margin-top:5px ;height: 5px;width: 100%;background: linear-gradient(20deg,  #000000 70%, #ddd9d500 70%);"></div>
      <p>${message2}</p>
      </div>`};
    ChatMessage.create(chatData, {});
  }

  // Create a chat button 
  /* Example
  addEventListenerOnHtmlElement("#createAdventure", 'click', (e) => {    
    createAdventure(data);
  });            
  message+=`<p>If you click the button this adventure will be posted in a journal.</p>`;
  message+=`<button style="background:#d10000;color:white" id="createAdventure">Create Adventure</button>`;  
  */
  static addEventListenerOnHtmlElement(element, event, func){    
    Hooks.on("renderChatMessage", (chatItem, html, data) => {
      if( html[0].querySelector(element) !== null ) {
        html[0].querySelector(element).addEventListener(event, func);
      }
    });
  }  
/*  
  static addEventListenerOnHtmlElement(element, event, func) {    
    Hooks.once("renderChatMessage", (chatItem, html) => { // Use Hook to add event to chat message html element
        html[0].querySelector(element).addEventListener(event, func);        
    });
  } // end addEventListenerOnHtmlElement
*/  


  // ---------------------------------------------------------------
  // GENERAL
  static isModuleOn(moduleName) {    
    if (game.modules.get(moduleName)?.active) { return true; }
    else { return false; }
  }

  // ---------------------------------------------------------------
  // Alchemy
  static async getItem(tokenD, itemName) {    
    const myItem = await tokenD.actor.items.getName(itemName);
    if (myItem==undefined) {
      this.styledChatMessage(itemName, '', `You don't have any <b>${itemName}</b>.`);       
    }
    return myItem;  
  }

  static async useItem(tokenD, itemName) {    
    const myItem = await tokenD.actor.items.getName(itemName);  
    await myItem.update({"data.quantity": myItem.data.data.quantity - 1})
    if(myItem.data.data.quantity < 1){
      myItem.delete();
    }      
  }

  // ---------------------------------------------------------------
  // Active Effets
  static getActiveEffect(tokenD, activeEffectLabel) {    
    const activeEffect = tokenD.actor.effects.find(e => e.data.label === activeEffectLabel);
    return activeEffect;
  }
  
  static async removeActiveEffect(tokenD, activeEffectLabel) {    
    const activeEffect = tokenD.actor.effects.find(e => e.data.label === activeEffectLabel);
    if (activeEffect!=undefined) {
      this.styledChatMessage('Active Effect', '', `${activeEffectLabel} removed.`);       
      activeEffect.delete();      
    }
  }  

  static async addActiveEffect(tokenD, activeEffectData) {    
    let activeEffectClass = getDocumentClass("ActiveEffect");
    const output = await activeEffectClass.create(activeEffectData, {parent:tokenD.actor});  
  }
  
  // ---------------------------------------------------------------
  // Debug
  static debug(message) {
    console.log('-----------------------------');
    console.log(message);
    console.log('-----------------------------');
  }
  
}

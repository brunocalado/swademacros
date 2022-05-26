// -----------------------
const version = '1.0';

const ALMOST_INVISIBLE = 0.1; // ?
const RAISE_SCALE_MAX = 5.0;  // ?
const RAISE_SCALE_MIN = 0.1;  // ?

export async function shape_changer_script(folderName='Bestiary') {
  let tokenD;
  let myActor;
  let mainFolder = game.folders.getName(folderName);      
    
  if (canvas.tokens.controlled.length==1) {
    if (mainFolder==undefined) {
      ui.notifications.error('There is no folder with this name.');
    } else {
      tokenD=canvas.tokens.controlled[0];
      myActor = tokenD.actor;    
      main();          
    }
  } else {
    ui.notifications.error('Select one token only.');
  }

  async function main() {
//    let folderName='Bestiary';
    
    let dialogue_content = `
      <p>Are you shape changing into another creature or are you reverting back to your normal form?</p>
      <p>If you are shape changing please select a creature to change into:</p>
      <p><b>Hint: You can type the size to filter.</b></p>
      
      <form>      
        <h2>Target Form Name</h2>
        <div class="form-group">          
          <input list="selected_sc_list" id="selected_sc" name="selected_sc">
          <datalist id="selected_sc_list">                
          </datalist>  
        </div>
      
        <div class="form-group">
          <label for="raise">Cast with a raise: </label>
          <input id="raise" name="raiseBox" type="checkbox"></input>
        </div>      
      </form>

      <script>
        function actorReader(folderName='${folderName}') {
          let mainFolder = game.folders.getName(folderName);      
          let itemsLabelList = [];
          for (let item of mainFolder.content) {
            let itemsLabel = new Object();
            itemsLabel.val = item.name;
            itemsLabel.text = "(" + item.data.data.stats.size + ") " + item.name;
            itemsLabelList.push(itemsLabel);      
          }
          return itemsLabelList;
        }      
        var list = document.getElementById('selected_sc_list');
        var actorsData = actorReader();
      
        actorsData.forEach(function(item){
           var option = document.createElement('option');
           option.value = item.val;
           option.textContent = item.text;

           list.appendChild(option);
        }); 
      </script>
      </br>
    `;    
    
    new Dialog({
      title: `Shape Change - ${version}`,
      content: dialogue_content,
      buttons: {
        one: {
          label: `<i class="fas fa-paw"></i>Shape Change`,
          callback: async (html) => {            
            const scID = html.find(`#selected_sc`)[0].value;  //Get actor based on provided ID:            
            const raise = html.find(`#raise`)[0].checked;     //Fetching raise:

            // Can't send documents (like actors) via the event system, so send the IDs instead, getting the documents in the GM code.
            let data = {
              type: "change", //or "revert"
              raise: raise,
              actorID: myActor.id,
              scID: scID,
              mainFolder: mainFolder,
              tokenID: tokenD.id,
              userID: game.user.id
            }
            console.log(data)
            warpgate.event.notify("shapeChangeTrigger", data); // Call api.js ready
          }
        },
        two: {
          label: `<i class="fas fa-user-alt"></i>Revert form`,
          callback: async () => {
            const ownerActorID = myActor.getFlag('swim', 'scOwner')
            let data = {
              type: "revert", //or "change"
              actorID: myActor.id,
              mainFolder: mainFolder,
              tokenID: tokenD.id,
              ownerActorID: ownerActorID,
            }
            console.log(data)
            warpgate.event.notify("shapeChangeTrigger", data);  // Call api.js ready
          }
        }
      },
      default: "one",
    }).render(true);
  }
   
}

export async function shape_changer_gm(data) {
  
  console.log('----------------')
  console.log('HERE')
  console.log('----------------')
  return 
  
  const tokenID = data.tokenID
  const token = canvas.tokens.get(tokenID)
  const actor = token.actor
  const mainFolder = data.mainFolder
  const userID = data.userID

  let folder = game.folders.getName("Shape Change Presets");
  let content = folder.content;
  let totalContent = folder.children.reduce((acc, subFolder) => {
    acc = acc.concat(subFolder.content);
    return acc;
  }, content);

  async function main() {
    if (data.type === "change") {
      const raise = data.raise
      const scID = data.scID
      let scPreset = totalContent.find(a => (a.id === scID)).toObject();
      //Creating a copy of the preset:
      scPreset.folder = mainFolder.id
      let scCopy = await Actor.create(scPreset); // Create a actor.

      //Saving the original actor ID to allow reverting.
      let originalID = actor.getFlag('swim', 'scOwner');

      //Failsafe to prevent setting the wrong actor ID in case of shape changing from one creature into another:
      if (originalID) {
        scCopy.setFlag('swim', 'scOwner', originalID);
        //pcID = originalID;
      } else {
        scCopy.setFlag('swim', 'scOwner', actor.id);
        originalID = false;
      }

      const scSize = scCopy.data.data.stats.size;

      await set_token_size(scCopy, scSize, raise);
      await set_tokenSettings(scCopy, originalID);
      await update_preset(scCopy, scSize, raise, originalID);
      // Now, add permission to scCopy by copying permissions of the original actor (that should also ensure the user get the token selected automatically):
      let perms = duplicate(actor.data.permission)
      await scCopy.update({
        permission: perms
      })

      await replace_token(scCopy);
      if (originalID) {
        actor.delete()
      }
    } else if (data.type === "revert") {
      const ownerActorID = data.ownerActorID
      const ownerActor = game.actors.get(ownerActorID)
      await update_pc(ownerActor);
      await replace_token(ownerActor);
      await actor.delete();
    } else {
      console.error("Invalid shape change request from player.")
    }
  }

  async function set_token_size(scCopy, scSize) {
    let height = 1;
    let width = 1;
    let scale = 1;

    if (scSize <= 2 && scSize >= 0) {
      // defaults
    } else if (scSize <= 5 && scSize >= 3) {
      height = width = 2;
    } else if (scSize <= 8 && scSize >= 6) {
      height = width = 4;
    } else if (scSize <= 11 && scSize >= 9) {
      height = width = 8;
    } else if (scSize > 11) {
      height = width = 16;
    } else if (scSize === -1) {
      scale = 0.85
    } else if (scSize === -2) {
      scale = 0.75
    } else if (scSize === -3) {
      scale = 0.6
    } else if (scSize <= -4) {
      scale = 0.5
    }

    // Make the token a little larger on a raise.
    if (data.raise) {
      let multiplier = game.settings.get('swim', 'shapeChange-raiseScaleMultiplier');
      // Ensure that if anything goes wrong, default to same size.
      if (!multiplier || multiplier < RAISE_SCALE_MIN ||
        multiplier > RAISE_SCALE_MAX) {
        multiplier = 1;
      }
      scale = scale * multiplier;
    }

    await scCopy.update({
      token: {
        height: height,
        width: width,
        scale: scale
      }
    })
  }

  async function set_tokenSettings(scCopy, pcID) {
    let updateData = {
      "token.actorLink": actor.data.token.actorLink,
      "token.bar1.attribute": actor.data.token.bar1.attribute,
      "token.bar2.attribute": actor.data.token.bar2.attribute,
      "token.disposition": actor.data.token.disposition,
      "token.lockRotation": actor.data.token.lockRotation,
      "token.name": actor.data.token.name,
      "token.randomImg": actor.data.token.randomImg,
      "token.vision": actor.data.token.vision,
      "token.displayBars": actor.data.token.displayBars,
      "token.displayName": actor.data.token.displayName,
      "token.alpha": ALMOST_INVISIBLE,
      "data.advances.value": actor.data.data.advances.value,
    }
    await scCopy.update(updateData)
  }

  async function update_preset(scCopy, scSize, raise, pcID) {
    let pc = pcID ? game.actors.get(pcID) : actor;
    let src = pcID ? actor : pc;
    let maxWounds = pc.data.data.wounds.max;
    /* "The caster does not inherit extra Wounds when transforming[.]" Leaving it here anyway in case s/o wan't to change that.
    if (scSize >= 4 && scSize <= 7) {maxWounds = pc.data.data.wounds.max + 1}
    else if (scSize >= 8 && scSize <= 11) {maxWounds = pc.data.data.wounds.max + 2}
    else if (scSize >= 12) {maxWounds = pc.data.data.wounds.max + 3}
    */
    //Higher Die Type in case of a raise:
    let updateStr = scCopy.data.data.attributes.strength.die.sides;
    let updateVig = scCopy.data.data.attributes.vigor.die.sides;
    if (raise === true) {
      updateStr = updateStr + 2;
      updateVig = updateVig + 2;
    }
    let updateData = {
      "data.attributes.smarts.die.sides": pc.data.data.attributes.smarts.die.sides,
      "data.attributes.spirit.die.sides": pc.data.data.attributes.spirit.die.sides,
      "data.attributes.strength.die.sides": updateStr,
      "data.attributes.vigor.die.sides": updateVig,
      "data.bennies.max": pc.data.data.bennies.max,
      "data.fatigue.max": pc.data.data.fatigue.max,
      "data.wounds.max": maxWounds,
      "data.attributes.smarts.animal": pc.data.data.attributes.smarts.animal,
      "data.powerPoints.value": pc.data.data.powerPoints.value,
      "data.powerPoints.max": pc.data.data.powerPoints.max,
      "name": `${scCopy.data.name} (${pc.data.name})`,
      "type": pc.type
    }

    let srcUpdates = {
      "data.bennies.value": src.data.data.bennies.value,
      "data.fatigue.value": src.data.data.fatigue.value,
      "data.wounds.value": src.data.data.wounds.value,
      "data.details.conviction.value": src.data.data.details.conviction.value,
      "data.details.conviction.active": src.data.data.details.conviction.active,
      "data.powerPoints.value": src.data.data.powerPoints.value,
      "data.details.archetype": `Shape Changed ${src.data.token.name}`,
      "data.wildcard": src.data.data.wildcard,
    }
    updateData = Object.assign(updateData, srcUpdates);

    //Doing Skills:
    let pcSkills = pc.data.items.filter(i => (i.data.type === "skill" && (i.data.data.attribute === "smarts" || i.data.data.attribute === "spirit")));
    let scSkills = scCopy.data.items.filter(i => (i.data.type === "skill" && (i.data.data.attribute === "smarts" || i.data.data.attribute === "spirit")));
    let skillsToCreate = pcSkills;
    for (let skill of scSkills) {
      let originalSkill = pcSkills.find(s => (s.data.name.toLowerCase() === skill.data.name.toLowerCase()));
      if (originalSkill) {
        await skill.update({
          "data.die.sides": originalSkill.data.data.die.sides
        })
        let index = skillsToCreate.indexOf(originalSkill);
        if (index >= 0) {
          skillsToCreate.splice(index, 1);
        }
      }
    }
    skillsToCreate = skillsToCreate.map(skill => skill.toObject()); //bring everything in order so foundry can create the items
    await scCopy.createEmbeddedDocuments('Item', skillsToCreate, {
      renderSheet: null
    });
    //console.warn("'renderSheet: null' may be changed to 'renderSheet: true' in a future version of SWADE.")

    //Doing Edges, Hindrances & Powers:
    let itemsToCreate = pc.data.items.filter(i => (i.data.type === "edge" || i.data.type === "hindrance" || i.data.type === "power"));
    //Taking care of these annoying AB specific power points:
    for (let power of itemsToCreate.filter(p => (p.data.type === "power"))) {
      if (power.data.data.arcane) {
        let arcaneBackground = power.data.data.arcane;
        let ppUpdates = {
          ['data.powerPoints.' + arcaneBackground + '.max']: src.data.data.powerPoints[arcaneBackground].max,
          ['data.powerPoints.' + arcaneBackground + '.value']: src.data.data.powerPoints[arcaneBackground].value
        }
        updateData = Object.assign(updateData, ppUpdates)
      }
    }

    itemsToCreate = itemsToCreate.map(i => i.toObject());
    await scCopy.createEmbeddedDocuments('Item', itemsToCreate);

    //Finally making all the Updates:
    await scCopy.update(updateData)
  }

  function decimal(num, places) {
    let power = 10 ** places;
    return parseInt(num * power) / power;
  }

  async function replace_token(scCopy) {
    // Play SFX:
    let shapeShiftSFX = game.settings.get('swim', 'shapeShiftSFX');
    if (shapeShiftSFX) {
      AudioHelper.play({
        src: `${shapeShiftSFX}`
      }, true);
    }
    // Play VFX:
    let shapeShiftVFX = game.settings.get('swim', 'shapeShiftVFX');
    if (shapeShiftVFX && game.modules.get("sequencer")?.active) {
      // Initiate special effects at the token location
      let scale = scCopy.data.token.scale;
      let sequence = new Sequence()
        .effect()
        .file(`${shapeShiftVFX}`) //recommendation: "modules/jb2a_patreon/Library/2nd_Level/Misty_Step/MistyStep_01_Regular_Green_400x400.webm"
        .atLocation(token)
        .scale(scale)
      sequence.play();
      await swim.wait(`100`);
    }
    // Make new token very opaque.
    // Spawns the new token using WarpGate
    let newTokenID = await warpgate.spawnAt(token.center, scCopy.data.name, {
      'alpha': ALMOST_INVISIBLE,
      'actorId': scCopy.data._id,
    });
    let newToken = canvas.tokens.get(newTokenID[0]);
    // When shifting to the same creature, WarpGate wants to use the old actor ID.
    // Set it to the newly created actor, otherwise the incorrect actor gets deleted!
    newToken.document.update({
      'actorId': scCopy.data._id
    });
    // Adding elevation of the original token to the new token
    await newToken.document.update({
      'elevation': token.data.elevation
    });
    // Update combatant info if a combat exists
    if (token.combatant != null) {
      let oldCombatData = token.combatant.toObject()
      await update_combat(newTokenID, oldCombatData)
    }
    // Morph the tokens from old to new.
    await morph_tokens(token, newToken, scCopy);
    // Remove the old token
    await warpgate.dismiss(token.id)
    // For GM, need to manually set the focus; include a short delay to allow the new token to appear.
    if (game.user.isGM === true) {
      await swim.wait(`100`);
      await newToken.control();
    }
  }

  async function morph_tokens(oldToken, newToken, scCopy) {
    // Adjust attributes of each token so the old appears to morph into the new.
    let oldUpdate;
    let newUpdate;
    // Alpha (opacity):
    let oldAlpha = oldToken.alpha;
    let newAlpha = ALMOST_INVISIBLE;
    // Scale:
    let oldScale = oldToken.data.scale;
    // When shifting to the same creature, WarpGate wants to use the old actor ID, which has the old scale.
    // Use the scale as calculated for the desired shape change data.
    let newScale = scCopy.data.token.scale; //newToken.data.scale;
    // How much to adjust each attribute per iteration is the difference between the two, divided by the number of iterations (+1).
    let NUM_MORPHS = game.settings.get("swim", "shapeChange-numMorphs");
    let alphaAdj = decimal((newAlpha - oldAlpha) / (NUM_MORPHS + 1), 4);
    let scaleAdj = decimal((newScale - oldScale) / (NUM_MORPHS + 1), 4);
    //console.warn('alpha: adj ' + alphaAdj + ' old ' + oldAlpha + ' new ' + newAlpha);
    //console.warn('scale: adj ' + scaleAdj + ' old ' + oldScale + ' new ' + newScale);
    for (let i = 0; i < NUM_MORPHS; i++) {
      // Opacity of both tokens are done in reverse (one fades in, the other out).
      oldAlpha = decimal(oldAlpha + alphaAdj, 4);
      newAlpha = decimal(newAlpha - alphaAdj, 4);
      // For scale, only change the old token.
      oldScale = decimal(oldScale + scaleAdj, 4);
      // Set token attribute structure values.
      oldUpdate = {
        'alpha': oldAlpha,
        'scale': oldScale
      };
      newUpdate = {
        'alpha': newAlpha,
        'scale': newScale
      };
      // Now apply them.
      await oldToken.document.update(oldUpdate);
      await newToken.document.update(newUpdate);
      //console.warn('alpha: old ' + oldAlpha + ' new ' + newAlpha + '  scale: old ' + oldScale + ' new ' + newScale);
    }
    // Final token setting (only need to do new token).
    newUpdate = {
      'alpha': 1,
      'scale': newToken.data.scale
    };
    await newToken.document.update(newUpdate);
  }

  async function update_combat(newTokenID, oldCombatData) {
    let newToken = canvas.tokens.get(newTokenID[0])
    await newToken.toggleCombat()
    let combatData = newToken.combatant.toObject()
    combatData.flags = oldCombatData.flags
    combatData.initiative = oldCombatData.initiative
    await newToken.combatant.update(combatData)
  }

  async function update_pc(ownerActor) {
    const npc = actor;
    await ownerActor.update({
      "data.bennies.value": npc.data.data.bennies.value,
      "data.fatigue.value": npc.data.data.fatigue.value,
      "data.wounds.value": npc.data.data.wounds.value,
      "data.details.conviction.value": npc.data.data.details.conviction.value,
      "data.details.conviction.active": npc.data.data.details.conviction.active,
      "data.powerPoints.value": npc.data.data.powerPoints.value,
    })
  }

  main()
}



/*******************************************************
 * SWADE Immersive Macros (SWIM) proudly presents:
 * The Shape Changer Macro.
 * This macro tries to handle everything relevant to the
 * Shape Change power in SWADE. It is in early stages,
 * so bugs may occur. Please create a ticket on the
 * gitHub if you find any problems with it:
 * https://github.com/SalieriC/SWADE-Immersive-Macros/issues/new
 * 
 * This macro requires Warp Gate by honeybadger:
 * https://foundryvtt.com/packages/warpgate
 * 
 * The Macro natively supports Sound Effects and if you
 * are using the Sequencer module by Wasp 
 * (https://foundryvtt.com/packages/sequencer), you can
 * also play a visual effect. SFX and VFX are configured
 * in the module settings of SWIM.
 * 
 * v. 2.0.5
 * By SalieriC
 ******************************************************/
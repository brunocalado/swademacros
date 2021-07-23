/* All tokens to Combat v1.3
* - This macro select all tokens in the scene
* - Add all of them to the combat tracker

* source: 
* icon: icons/magic/time/clock-stopwatch-white-blue.webp
*/

(async () => {
  
  const combat = !game.combat ? await Combat.create({scene: canvas.scene.id, active: true}) : game.combat;

  let toCreate = [];

  const tokens = canvas.tokens.placeables;

  if(tokens.length){
      for(let t of tokens){
          if(t.inCombat) continue;
          toCreate.push({tokenId: t.id, hidden: t.data.hidden});
      }
      const combatants = await combat.createEmbeddedDocuments("Combatant", toCreate);
  }

})()
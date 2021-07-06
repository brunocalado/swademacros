let myActor = game.actors.getName('Actor Name');  // or use any other method of getting an actor
let myActiveEffect = {icon: "systems/swade/assets/icons/status/status_protection.svg", label: "Protection", changes: [{key:"data.stats.toughness.armor", value:4, mode:CONST.ACTIVE_EFFECT_MODES.ADD}]};

let activeEffectClass = getDocumentClass("ActiveEffect");
await activeEffectClass.create(myActiveEffect, {parent:myActor});
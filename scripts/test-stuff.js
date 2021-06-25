

let myActor = canvas.tokens.controlled[0];
let attribute = 'smarts'; 
let skill = 'Athletics'; 

sm.debug('Debug');
sm.rollAttribute(myActor, attribute).toMessage();
sm.rollSkill(myActor, skill).toMessage();
sm.debug(sm.getWounds(myActor));


sm.applyWounds(token, val)
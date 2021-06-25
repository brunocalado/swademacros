

let myActor = canvas.tokens.controlled[0];
let attribute = 'smarts'; 
let skill = 'Athletics'; 

sm.debug('Debug');
sm.rollAttribute(myActor, attribute).toMessage();
sm.rollSkill(myActor, skill).toMessage();
sm.debug(sm.getWounds(myActor));


sm.applyWounds(token, val)




/*  
  static async bennieChangeGM(val) {
    let gms = game.users.filter(u => u.hasRole(CONST.USER_ROLES.GAMEMASTER)); 

    for (const gm of gms) {
      await gm.update({"flags.swade.bennies": gm.data.flags.swade.bennies + val});
    }    
  }
*/  
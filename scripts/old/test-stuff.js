

let myActor = canvas.tokens.controlled[0];
let tokenD = canvas.tokens.controlled[0];
let attribute = 'smarts'; 
let skill = 'Athletics'; 

sm.debug('Debug');
sm.rollAttribute(myActor, attribute).toMessage();
sm.rollSkill(myActor, skill).toMessage();
sm.debug(sm.getWounds(myActor));


sm.applyWounds(token, val)


let myActor = canvas.tokens.controlled[0];
let tmp = myActor.actor.data.items.filter(i => (i.type === 'skill') ).map(i => (i.name ));
tmp.map(i => (i.name ));


let tokenD = canvas.tokens.controlled[0];
sm.checkBennies(tokenD)
sm.useBenny(tokenD) 

spendBenny(tokenD) 


/*  
  static async bennieChangeGM(val) {
    let gms = game.users.filter(u => u.hasRole(CONST.USER_ROLES.GAMEMASTER)); 

    for (const gm of gms) {
      await gm.update({"flags.swade.bennies": gm.data.flags.swade.bennies + val});
    }    
  }
*/  

//content: `<p><b style="color:red">${game.user.name}</b> is Shaken now!</p>`,
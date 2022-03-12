const version = 'v1.6';

/*
icon: /icons/svg/up.svg
source: https://gist.githubusercontent.com/bloy/f82dcd44d949f820bd9375b1a790b3cc/raw/1e369a6ae01d89a50fd9a72aaa0daff7f8a30a2b/boost_lower_trait.js
*/

const UPICON = "icons/magic/life/cross-embers-glow-yellow-purple.webp";
const DOWNICON = "icons/magic/movement/chevrons-down-yellow.webp";

if ( canvas.tokens.controlled[0]===undefined && Array.from(game.user.targets)[0]===undefined ) {
  ui.notifications.error("Please, select or target a token."); // No Token is Selected
} else {
  main();
}

async function main() {
  let tokens = [];
  tokens = tokens.concat(Array.from(game.user.targets));
  tokens = tokens.concat(canvas.tokens.controlled);

  let traits = {
    "Agility": { 
      type: "attribute",
      name: "Agility",
      modkey: "data.attributes.agility.die.modifier",
      diekey: "data.attributes.agility.die.sides"
    },
    "Smarts": { 
      type: "attribute",
      name: "Smarts",
      modkey: "data.attributes.smarts.die.modifier",
      diekey: "data.attributes.smarts.die.sides"
    },
    "Spirit": { 
      type: "attribute",
      name: "Spirit",
      modkey: "data.attributes.spirit.die.modifier",
      diekey: "data.attributes.spirit.die.sides"
    },
    "Strength": { 
      type: "attribute",
      name: "Strength",
      modkey: "data.attributes.strength.die.modifier",
      diekey: "data.attributes.strength.die.sides"
    },
    "Vigor": { 
      type: "attribute",
      name: "Vigor",
      modkey: "data.attributes.vigor.die.modifier",
      diekey: "data.attributes.vigor.die.sides"
    }
  };

  for (let token of tokens) {
    let skills = token.actor.items.filter(e => e.type == "skill");
    for (const skill of skills) {
        let name = skill.data.name;
        traits[name] = { type: "skill", name: name, 
                         modkey: `@Skill{${name}}[data.die.modifier]`, 
                         diekey: `@Skill{${name}}[data.die.sides]` };
    }
  }

  let traitoptions = `<select id="select-trait" name="select-trait">`;
  for (let trait in traits) {
    traitoptions += `<option value="${trait}">${trait}</option>`;
  }
  traitoptions += `</select>`;

  let applyChanges = false;
  let raise = false;
  new Dialog({
      title: `Boost/Lower Trait - ${version}`,
      content: `
      <style>
        div.blueTable {
          width: 100%;
          text-align: center;
          border-collapse: collapse;
        }
        .divTable.blueTable .divTableCell, .divTable.blueTable .divTableHead {
        }
        .blueTable .tableFootStyle {
          font-size: 14px;
        }
        .blueTable .tableFootStyle .links {
           text-align: right;
        }
        .blueTable .tableFootStyle .links a{
          display: inline-block;
          background: #1C6EA4;
          color: #FFFFFF;
          padding: 2px 8px;
          border-radius: 5px;
        }
        .blueTable.outerTableFooter {
          border-top: none;
        }
        .blueTable.outerTableFooter .tableFootStyle {
          padding: 3px 5px; 
        }
        /* DivTable.com */
        .divTable{ display: table; }
        .divTableRow { display: table-row; }
        .divTableHeading { display: table-header-group;}
        .divTableCell, .divTableHead { display: table-cell;}
        .divTableHeading { display: table-header-group;}
        .divTableFoot { display: table-footer-group;}
        .divTableBody { display: table-row-group;}
      </style>      
      
        <div class="divTable blueTable">
        <div class="divTableBody">
        <div class="divTableRow">
        <div class="divTableCell"><b>Which Trait?</b></div>
        <div class="divTableCell"><b>Boost or Lower?</b></div>
        </div>
        <div class="divTableRow">
        <div class="divTableCell">${traitoptions}</div>
        <div class="divTableCell">
            <select id="select-direction" name="select-direction">
                <option value="Boost">Boost</option>
                <option value="Lower">Lower</option>
            </select        
        </div>
        </div>
        </div>
        </div>
        </br>
      `,
      buttons: {
          apply: {
              label: "Apply",
              callback: () => {applyChanges = true; raise}
          },
          raise: {
              label: "Apply with raise",
              callback: () => {applyChanges = true; raise = true}
          },
          cancel: {
              label: "Cancel"
          }
      },
      default: "apply",
      close: html => {
          if (applyChanges) {
              let direction = html.find('[name="select-direction"]')[0].value;
              let trait = html.find('[name="select-trait"]')[0].value;
              createEffect(tokens, traits, direction, trait, raise);
          }
      }
  }).render(true);
} // end main

async function createEffect(tokens, traits, direction, trait, raise) {
  trait = traits[trait];
  for (let tokenD of tokens) {
    let currentdie = 0;
    let currentmod = 0;
    if (trait["type"] == "attribute") {
      let part;
      let val = tokenD.actor.data;
      for (part of trait["diekey"].split(".")) {
          val = val[part];
      }
      currentdie = val
      val = tokenD.actor.data
      for (part of trait["modkey"].split(".")) {
          val = val[part];
      }
      currentmod = val;
    } else {
      let skill = tokenD.actor.items.filter(s => s.type == "skill").find(s => s.data.name == trait["name"])
      if (skill) {
        currentdie = skill.data.data.die.sides;
        currentmod = skill.data.data.die.modifier;
      } 
    }
    if (currentdie == 0) {
      continue;
    }
    if (currentdie == 4 && direction == "Lower") {
      continue;
    }
    let diemod = 2;
    let modmod = 0;
    if (direction == "Lower") {
      diemod = -2;
    }
    if (currentdie == 6 && direction == "Lower" && raise) {
      diemod = -1;
    } else if (currentdie == 12 && direction == "Boost") {
      diemod = 0;
      modmod = 1;
    }
    if (raise) {
      diemod *= 2;
      modmod *= 2;
    }
    if (currentdie == 10 && direction == "Boost" && raise) {
      diemod = 2;
      modmod = 1;
    }

    const effectData = {
      embedded: {
        ActiveEffect:{ 
          label: {
            label: `${raise ? "major" : "minor"} ${direction} ${trait.name}`,
            icon: direction == "Lower" ? DOWNICON : UPICON,
            changes: [{                    
              "key": trait["diekey"],
              "mode": 2,
              "value": diemod,
              "priority": 0
            },{
              "key": trait["modkey"],
              "mode": 2,
              "value": modmod,
              "priority": 0
            }],
            duration: {
              "rounds": direction == "Lower" ? 1 : 5
            },
            flags: {
              swade: {
                "expiration": 3,
              }
            }
          }
        }
      }      
    };

    boostMessage(tokenD.name, direction, trait.name, raise ? "major" : "minor"); // chat message
    await applyUniqueEffect(tokenD, effectData);    
  } // LOOP - END FOR 
}

// define applyUniqueEffect function
async function applyUniqueEffect(tokenD, myActiveEffect) {
  let activeEffectClass = getDocumentClass("ActiveEffect");
  const output = await warpgate.mutate(tokenD.document, myActiveEffect, {}, {permanent: true});  
}

function boostMessage(tokenD, direction, traitName, raise) {
  let message = ``;
  message += `<h2>${direction}</h2>
    ${tokenD} will ${raise} ${direction} ${traitName}.`;  

  let chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
    content: message
  };  
  ChatMessage.create(chatData, {});
}

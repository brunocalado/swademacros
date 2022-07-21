const version = 'v0.1';

/* TODO
*/

// Requires at least 1 target
let tokens = [...new Set([...canvas.tokens.controlled, ...game.user.targets])]; //use deduplication to get rid of those which are both, selected and targeted:

if (tokens.length==0) {
  ui.notifications.warn("You must select a token and target another one!");    
} else {
  main();
}


function main() {  
  // call this with: game.settings.get("swademacros", "fixItemTrait")
  const skillsSettings = game.settings.get("swademacros", "fixItemTrait").split(',');
  const skills = skillsSettings.map(element => {
    return element.trim();
  });

  let skillsList = ``;
  skills.map((t) => {
    skillsList += `<option value="${t}">${t}</option>`;
  });

  let template = `      
    <h2 style="text-align:center;color:red;">WARNING</h2>
    <p>This macro will apply the selected skill to all items traits from the type you select.</p>
    <table>
      <tbody>
        <tr ALIGN=CENTER>
          <td>Skill (Choose)</td>
          <td>Item Type</td>
        </tr>
        <tr ALIGN=CENTER>
          <td>
            <select id="skill" type="text" style="width: 100px; text-align: center;">
              ${skillsList}
            </select>            
          </td>
          <td>
            <select id="itemType" type="text" style="width: 100px; text-align: center;">
              <option value="weapon">Weapon</option>
              <option value="power">Power</option>
            </select>           
          </td>
        </tr>
      </tbody>
    </table>

    <br>    
  `;
  
  new Dialog({
    title: `Fix Item Trait - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "Fix it!",
        callback: async (html) => {
          await fixItemTrait(html);
        },
      },
      cancel: {
        label: "Cancel",
      }
    },
    default: "ok"
  }, {}).render(true);
  
}

async function fixItemTrait(html) {
  const skill = html.find("#skill")[0].value;    
  const itemType = html.find("#itemType")[0].value;      

  for (var tokenD of tokens) {
    let actorid = tokenD.actor.id;
    patchItems(actorid, itemType, skill);
  }  
  
}

async function patchItems(actorID, itemType, skill) {
  let character = game.actors.get(actorID);
  
  let items = character.items.filter(e => e.type===itemType);  
  // update
  for (item of items) {
    const todo = await item.update({
      ["data.actions.skill"]: skill
    }); 
  }

}

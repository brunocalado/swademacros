const version = '1.1';
const sm = game.modules.get('swademacros')?.api.sm;
let tokens = [...new Set([...canvas.tokens.controlled, ...game.user.targets])]; //use deduplication to get rid of those which are both, selected and targeted:
let applyChanges = false;

if (tokens.length === 0) {
  ui.notifications.error("Please, select or target a token."); // No Token is Selected
} else {
  main();
}

function main() {
  let currentDispositionList = `<ul>`;
  for (var tokenD of tokens) {
    currentDispositionList += `<li><b>${tokenD.name}: </b>${ dispositionToText(tokenD.document.data.disposition) }</li>`;
  }    
  currentDispositionList += `</ul>`;
  
  let template = `
    <form>
      <div class="form-group">
        <label>Disposition Type:</label>
        <select id="dispo-type" name="dispo-type">
          <option value="nochange">No Change</option>
          <option value="hostile">Hostile</option>
          <option value="neutral">Neutral</option>
          <option value="friendly">Friendly</option>
        </select>
      </div>
    </form> 
    ${currentDispositionList}
  `;
  
  new Dialog({
    title: `Token Disposition Changer - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "Apply",
        callback: async (html) => {
          dispositionModifier(html);
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
  }).render(true);  
  
}

async function dispositionModifier(html) {
  const dispoType = html.find('[name="dispo-type"]')[0].value.toUpperCase();
  if(dispoType === "NOCHANGE") return;
  const updates = await tokens.map(t => ({_id: t.id, disposition: CONST.TOKEN_DISPOSITIONS[dispoType]}));
  await canvas.scene.updateEmbeddedDocuments("Token", updates)
}

function dispositionToText(disposition) {
  if (disposition==-1) {
    return `<b style="color:red;">Hostile</b>`;
  } else if (disposition==0) {
    return `<b style="color:black;">Neutral</b>`;
  } else {
    return `<b style="color:darkgreen;">Friendly</b>`;
  }    
}

// sourcE: community macros

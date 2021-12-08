/*
// Open a dialog for quickly changing token vision parameters of the controlled tokens.
// This macro was originally written by @Sky#9453
// https://github.com/Sky-Captain-13/foundry
// SWADE (this) version by SalieriC

// Since return only works in functions, the sole purpose of the main() function is to stop the macro from executing if no token is selected.
*/

const version = 'v1.1';
const chatimage = "icons/sundries/lights/torch-brown-lit.webp";

if (canvas.tokens.controlled[0]===undefined) {
  ui.notifications.error("Please, select a token."); // No Token is Selected
} else {
  main();
}

function main() {
  // Add Vision Type only if the Game Master is using the Macro
  let dialogue_content = `
    <form>
      <div class="form-group">
        <label>Light Source:</label>
        <select id="light-source" name="light-source">
          <option value="nochange">No Change</option>
          <option value="none">None</option>
          <option value="candle">Candle [dim=0/bright=2]</option>
          <option value="lamp">Lantern [dim=0/bright=4]</option>
          <option value="bullseye">Lantern (Bullseye) [dim=0/bright=2/angle=50]</option>
          <option value="torch">Torch [dim=0/bright=4]</option>
          <option value="flLight">Flashlight [dim=0/bright=10/angle=50]</option>
        </select>
      </div>
      <div class="form-group">
        <label>Vision Type:</label>
        <select id="vision-type" name="vision-type">
          <option value="nochange">No Change</option>
          <option value="pDark">Pitch Darkness (0") [dim=0/bright=0]</option>
          <option value="dark">Dark (10") [dim=10/bright=0]</option>
          <option value="dim">Dim [dim=1000/bright=10]</option>
          <option value="lowLiVis">Low Light Vision [dim=1000/bright=0]</option>
          <option value="infrVis">Infravision [dim=1000/bright=0]</option>
          <option value="fullNiVis">Full Night Vision [dim=0/bright=1000]</option>
        </select>
      </div>
    </form>
`;

  let applyChanges = false;
  let dialogButtons = {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: `Apply Changes`,
      callback: (html) => {
        changeVision(html);
      }
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: `Cancel Changes`
    }   
  }  
  
  // Main Dialogue    
  new Dialog({
    title: `Token Vision - ${version}`,
    content: dialogue_content,
    buttons: dialogButtons,
    default: "yes",
  }).render(true);
}

async function changeVision(html) {
  for (let tokenD of canvas.tokens.controlled) {
    let visionType;
    let lightSource = html.find('[name="light-source"]')[0].value || "none";
    let dimSight = 0;
    let brightSight = 0;
    let dimLight = 0;
    let brightLight = 0;
    let lightAngle = 360;
    let lockRotation = tokenD.data.lockRotation;

    // Get Vision Type Values
    visionType = html.find('[name="vision-type"]')[0].value || "none";
    switch (visionType) {
      case "pDark":
        dimSight = 0;
        brightSight = 0;
        break;
      case "dark":
        dimSight = 10;
        brightSight = 0;
        break;
      case "dim":
        dimSight = 1000;
        brightSight = 10;
        break;
      case "lowLiVis":
        dimSight = 1000;
        brightSight = 0;
        break;
      case "infrVis":
        dimSight = 1000;
        brightSight = 0;
        break;
      case "fullNiVis":
        dimSight = 0;
        brightSight = 1000;
        break;
      case "nochange":
        break;
      default:
        dimSight = tokenD.data.dimSight;
        brightSight = tokenD.data.brightSight;
    }
    // Get Light Source Values
    switch (lightSource) {
      case "none":
        dimLight = 0;
        brightLight = 0;
        break;
      case "candle":
        dimLight = 0;
        brightLight = 2;
        break;
      case "lamp":
        dimLight = 0;
        brightLight = 4;
        break;
      case "bullseye":
        dimLight = 0;
        brightLight = 4;
        lockRotation = true;
        lightAngle = 52.5;
        break;
      case "torch":
        dimLight = 0;
        brightLight = 4;
        break;
      case "flLight":
        dimLight = 0;
        brightLight = 10;
        lockRotation = true;
        lightAngle = 52.5;
        break;
      case "nochange":
        break;
      default:
        dimLight = tokenD.data.dimLight;
        brightLight = tokenD.data.brightLight;
        lightAngle = tokenD.data.lightAngle;
        lockRotation = tokenD.data.lockRotation;
        break;
    }
    // Update Token
    const updatePromise = await tokenD.document.update({
      vision: true,
      dimSight: dimSight,
      brightSight: brightSight,
      dimLight: dimLight,
      brightLight: brightLight,
      lightAngle: lightAngle,
      lockRotation: lockRotation
    });

    // chat
    let message=``;    
    const myTitle = `<img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Illumination`;      
    message += `<p><b>${tokenD.name}</b> made changes to vision/illumination.</p>`;
    message += `<ul><li>Dim Sight: ${dimSight}</li>`;
    message += `<li>Bright Sight: ${brightSight}</li>`;
    message += `<li>Dim Light: ${dimLight}</li>`;
    message += `<li>Bright Light: ${brightLight}</li>`;
    message += `<li>Light Angle: ${lightAngle}</li></ul>`;
    sm.styledChatMessage(myTitle, '', message); // send message
  }  // end for     
} // end changeVision

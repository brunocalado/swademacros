const folderName = 'Bestiary'; // Replace Bestiary for your folder name.



// -----------------------------------------
const version = '1.1';
const sm = game.modules.get('swademacros')?.api.sm;
const myFolder = game.folders.getName(folderName);

if (myFolder==undefined && myFolder.content.length>0) {
  ui.notifications.error(`Please, create a actors folder ${folderName} with at least on actor.`);
} else {
  main();
}

function main() {
  const actorNames = actorReader();
  
  let dialogue_content = `
    <form>
    
      <h2>Actor Name</h2>
      <div class="form-group">      
        
        <input list="aeTypes" id="aeType" name="aeType">
        <datalist id="aeTypes">
              
        </datalist>  
      </div>
    
    </form>

    <script>
      var list = document.getElementById('aeTypes');
      var skills2 = Array( ${actorNames} );
    
      skills2.forEach(function(item){
         var option = document.createElement('option');
         option.value = item;
         list.appendChild(option);
      }); 
    </script>
    </br>
`;

  let applyChanges = false;
  let dialogButtons = {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: `Summon!`,
      callback: (html) => {
        summonMyActor(html);
      }
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: `Cancel`
    }   
  }

  // Main Dialogue    
  new Dialog({
    title: `Summon Actor - ${version}`,
    content: dialogue_content,
    buttons: dialogButtons,
    default: "yes",
  }).render(true);
}

// return array actor names
function actorReader() {
  let itemsLabel = [];
  for (let folder of myFolder.content) {
    itemsLabel.push("\"" + folder.name + "\"");
  }
  return itemsLabel;
}
  
async function summonMyActor(html) {
  let aekey = html.find("#aeType")[0].value;
  console.log(aekey);
 
  await warpgate.spawn(aekey) 
}
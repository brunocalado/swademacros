/*
source: 
icon: icons/sundries/gaming/rune-card.webp
*/
const version = '1.1';
main();

async function main() {
  new Dialog({
    title: `Images To Folder - ${version}`,
    content: `
    <h3>Important</h3>
    <ul>
      <li>To get the folder path right, you can drop a tile from it in the canvas and copy the path.</li>
    </ul>
    <h3>Form</h3>
    <div>
      <p>Folder Name: </p>
      <input type="text" id="folderName" value='The Office'/>
    </div>
    <div>
      <p>Folder Path: </p>
      <input type="text" id="folderPath" value='assets/decks/TheOffice/'/>
    </div>    
    `,
    buttons: {
      roll: {
        label: "Create",
        callback: (html) => {
          createImageFolder(html);
        }
      }, 
      cancel: {
        label: "Cancel"
      }
    }
  }).render(true)
}

async function createImageFolder(html) {
  const folderName = html.find("#folderName")[0].value;  
  const folderPath = html.find("#folderPath")[0].value;  

  const createdFolder = await Folder.createDocuments([{name: folderName, type: "JournalEntry"}]);
  const folderID = createdFolder[0].id;

  let {files} = await FilePicker.browse("data", folderPath);
  
  var splitPath = function (str) {
    let imageName = str.split('\\').pop().split('/').pop(); // remove path
    return imageName.split('.').slice(0, -1).join('.'); // remove extension
  }
  
  for (let img of files) {
    await JournalEntry.create({
      img,
      name: splitPath(img), // fix this to something more creative than naming it the file name :D
      folder: folderID
    });
  }
  
}
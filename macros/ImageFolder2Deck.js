const version = '1.1';
const defaultPath = 'modules/swadecore/images/adventure-deck';

main();

async function main() {
  new Dialog({
    title: `Images To Deck - ${version}`,
    content: `
    <h2>Important!</h2>
    <ul>
      <li>To get the folder path right, you can drop a tile from it in the canvas and copy the path.</li>
      <li>Leave Card Back Image blank if you don't want to add the Card Back Image.</li>
    </ul>
    <h2>Configuration</h2>
    <div>
      <p>Deck Name: </p>
      <input type="text" id="folderName" value='The Office'/>
    </div>
    <div>
      <p>Folder Path: </p>
      <input type="text" id="folderPath" value=${defaultPath}/>
    </div>    
    <div>
      <p>Card Back Image (optional): </p>
      <input type="text" id="cardBackImg" value=''/>
    </div>    
    <br>
    `,
    buttons: {
      roll: {
        label: "Create",
        callback: (html) => {
          createDeck(html);
        }
      }, 
      cancel: {
        label: "Cancel"
      }
    }
  }).render(true)
}

async function createDeck(html) {
  const deckName = html.find("#folderName")[0].value;  
  const folderPath = html.find("#folderPath")[0].value;  
  const cardBackImg = html.find("#cardBackImg")[0].value;  

  let {files} = await FilePicker.browse("data", folderPath);
  
  // Name Cleaning
  var splitPath = function (str) {
    let imageName = str.split('\\').pop().split('/').pop(); // remove path
    imageName = imageName.split('.').slice(0, -1).join('.'); // remove extension
    imageName = imageName.replace(/_/g, " ");
    imageName = imageName.replace(/-/g, " ");
    imageName = decodeURI( imageName )
    return imageName;
  }

  //create the empty deck
  const deck = await Cards.create({
    name: deckName,
    type: 'deck',
  });

  //map the journal entry data to the raw card data
  const rawCardData = files.map((file) => {
    // file = imagePath and splitPath(file) = image name
    const imagePath = file;
    const imageName = splitPath(file);
    return {
      name: imageName,
      type: 'base',
      faces: [
        {
          img: imagePath,
          name: imageName,
        },
      ],
      back: {
        name: '',
        text: '',
        img: cardBackImg
      },      
      face: 0,
      origin: deck?.id,
    };
  });
  
  //create the cards in the deck
  deck?.createEmbeddedDocuments('Card', rawCardData);
  
  //open the sheet once we're done
  deck?.sheet?.render(true);  

} // end createDeck
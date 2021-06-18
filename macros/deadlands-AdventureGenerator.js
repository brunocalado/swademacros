const version = '1.0';
// icon: modules/deadlands-core-rules/assets/icons/deadlands-logo.webp

main();

async function main() {
  let message;

  let Objective = await drawFromTable('Objective');
  let Obstacle = await drawFromTable('Obstacle');
  let Complication = await drawFromTable('Complication');
  
  let adventureContent = `<h2>Objective</h2>` + Objective.results[0].text;
  adventureContent += `<h2>Obstacle</h2>` + Obstacle.results[0].text;
  adventureContent += `<h2>Complication</h2>` + Complication.results[0].text;  

  let data = {
    name: 'My New Adventure',
    content: adventureContent
  };

  addEventListenerOnHtmlElement("#createAdventure", 'click', (e) => {    
    createAdventure(data);
  });            
  message+=`<p>If you click the button this adventure will be posted in a journal.</p>`;
  message+=`<button style="background:#d10000;color:white" id="createAdventure">Create Adventure</button>`;
  
  let chatData = {
    user: game.user.id,    
    content: message,
    whisper : ChatMessage.getWhisperRecipients("GM")
  };   
  ChatMessage.create(chatData, {});  
}

function addEventListenerOnHtmlElement(element, event, func){    
    Hooks.once("renderChatMessage", (chatItem, html) => { // Use Hook to add event to chat message html element
        html[0].querySelector(element).addEventListener(event, func);        
    });
} // end addEventListenerOnHtmlElement

async function createAdventure(data) {  
  const instantAdventure = await JournalEntry.create(data);
  await instantAdventure.sheet.render(true);    
}

async function drawFromTable(tableName) {
  let list_compendium = await game.packs.filter(p=>p.documentName=='RollTable');      
  let inside = await list_compendium.filter( p=>p.metadata.label=='Deadlands Tables' )[0].getDocuments();      
  let table = await inside.filter( p=>p.data['name']==tableName )[0];
  
  if (!table) {
    ui.notifications.warn(`Table ${tableName} not found.`, {});
    return;
  }
  return await table.draw({rollMode: 'gmroll'});
}


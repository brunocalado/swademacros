const version = 'v1.0';
const chatimage = 'icons/commodities/tech/antenna-powered-purple.webp';
let coreRules = false;
const coreRulesLink = '@Compendium[sprawl-core-rules.sprawl-rules.YlzlYF4w9OiFgHTG]{Cyberspace Actions}';
if (game.modules.get("sprawl-core-rules")?.active) { coreRules = true; }

/* 
IMPORTANT
- 

TODO
- 
source: 
icon: 
*/

main();

function main() {  

  let inoutActions = ['Choose', 'ANALYZE NODE/PERSONA/ICE/ICON','ATTACK PERSONA/ICE', 'HIDE FROM ICE/PERSONA', 'IMPROVISE A UTILITY', 'JACK OUT', 'LOAD/END UTILITY'];
  let outActions = ['Choose', 'SEARCH FOR A SYSTEM WITH AN UNKNOWN ADDRESS'];
  let inActions = ['Choose', 'ACCESS ENCRYPTED DATA', 'DECEIVE ICE', 'EDIT/COPY/ERASE DATA', 'MANIPULATE A DEVICE PORT'];

  let inoutActionsList = ``;
  inoutActions.map((t) => {
    inoutActionsList += `<option value="${t}">${t}</option>`;
  });
  let outActionsList = ``;
  outActions.map((t) => {
    outActionsList += `<option value="${t}">${t}</option>`;
  });
  let inActionsList = ``;
  inActions.map((t) => {
    inActionsList += `<option value="${t}">${t}</option>`;
  });
  
  let template = `  
    <style type="text/css">
      div.purpleHorizon {
        border: 4px solid #ff0000;
        background-color: #000000;
        width: 100%;
        text-align: center;
        border-collapse: collapse;
      }
      .divTable.purpleHorizon .divTableCell, .divTable.purpleHorizon .divTableHead {
        border: 0px solid #550000;
        padding: 5px 2px;
      }
      .divTable.purpleHorizon .divTableBody .divTableCell {
        font-size: 13px;
        font-weight: bold;
        color: #FFFFFF;
      }
      
      .divTable{ display: table; }
      .divTableRow { display: table-row; }
      .divTableHeading { display: table-header-group;}
      .divTableCell, .divTableHead { display: table-cell;}
      .divTableHeading { display: table-header-group;}
      .divTableFoot { display: table-footer-group;}
      .divTableBody { display: table-row-group;}

      /* HIDE RADIO */
      [type=radio] { 
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      }

      /* IMAGE STYLES */
      [type=radio] + img {
      cursor: pointer;
      }

      /* CHECKED STYLES */
      [type=radio]:checked + img {
      outline: 4px solid #f00;
      }
      
      .container {
        position: relative;
        text-align: center;
        color: white;
      }
      /* Centered text */
      .centered {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 18px;
      }    

      #kultcss .window-content {    
        background: #000000;
      }     
      #kultcss .dialog-button {
        height: 40px;
        background: #000000;
        color: #ffffff;
        justify-content: space-evenly;
        align-items: center;
        cursor: pointer;
        border: none;    
      }  
      #kultcss header {
        background: #000000;
        border-radius: 0;    
        border: none;    
        margin-bottom: 2px;
        font-size: .75rem;
      }
    </style>    
    
    <h1 style="text-align:center; color:white">ACTIONS</h1>
    
    <h2 style="text-align:center; color:white">INSIDE/OUTSIDE SYSTEMS NODES</h2>
    
    <div class="divTable purpleHorizon">
    <div class="divTableBody">
    
    <div class="divTableRow">
    <div class="divTableCell">
        <select id="inoutActionsList" type="text" style="width: 340px; box-sizing: border-box;border: none;background-color: #ff0000;color: white; text-align: center;">
          ${inoutActionsList}
        </select>      
    </div>
    </div>
    
    </div>
    </div>    
    
    <h2 style="text-align:center; color:white">OUTSIDE OF SYSTEMS/NODES</h2>

    <div class="divTable purpleHorizon">
    <div class="divTableBody">
    
    <div class="divTableRow">
    <div class="divTableCell">
        <select id="outActionsList" type="text" style="width: 340px; box-sizing: border-box;border: none;background-color: #ff0000;color: white; text-align: center;">
          ${outActionsList}
        </select>      
    </div>
    </div>
    
    </div>
    </div>  

    <h2 style="text-align:center; color:white">WITHIN SYSTEMS/NODES</h2>
    
    <div class="divTable purpleHorizon">
    <div class="divTableBody">
    
    <div class="divTableRow">
    <div class="divTableCell">
        <select id="inActionsList" type="text" style="width: 340px; box-sizing: border-box;border: none;background-color: #ff0000;color: white; text-align: center;">
          ${inActionsList}
        </select>      
    </div>
    </div>
    
    </div>
    </div>  

  `;
  
  new Dialog({
    title: `Cyberspace Actions - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "EXEC!",
        callback: async (html) => {
          sendAction(html);
        },
      },
      cancel: {
        label: "Cancel",
      }
    },
    default: "ok"
  }, { id: 'kultcss'}).render(true);
}

async function sendAction(html) {
  const inoutActionsList = html.find("#inoutActionsList")[0].value;    
  const outActionsList = html.find("#outActionsList")[0].value;    
  const inActionsList = html.find("#inActionsList")[0].value;    
  let message;
  let temp;
  
  if (coreRules) {
      message = `<div class="swade-core"><h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> ${coreRulesLink}</h2><div>`;
  } else {
     message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Cyberspace Actions</h2>`;
  }    

  if (inoutActionsList!='Choose') {
    temp = inoutActionsList;
  } else if (outActionsList!='Choose') {
    temp = outActionsList;
  } else if (inActionsList!='Choose') {
    temp = inActionsList;
  } else {
    ui.notifications.error("You must choose one action!!!");    
    return;
  }   
  
  message += idToDescription(temp);

  // send message1
  let chatData = {
    content: message
  };  
  ChatMessage.create(chatData, {});
  
}

function idToDescription(myid) {  
  if (myid=='ANALYZE NODE/PERSONA/ICE/ICON') {
    return `<h3>ANALYZE NODE/PERSONA/ICE/ICON</h3>
<p>Requirements: Notice Utility</p>
<p>The appearance of a non-hidden object is revealed simply by looking at it, and can often provide experienced operators with valuable instant information about it (for example, armed soldiers usually represent nasty ICE, while data storages often appear as cubes or bookshelves).</p>
<p>Analyzing a persona, ICE, or icon within the same Node as the operator takes an action. On a success the operator learns the type and rating of the analyzed object.</p>`;
  } else if (myid=='ATTACK PERSONA/ICE') {
    return `<h3>ATTACK PERSONA/ICE</h3>
<p>Requirements: Fighting Utility</p>
<p>This works like Fighting. Cyberspace Parry is calculated with the Fighting Utility or ICE Rating.</p>
<p>(ICE is always considered to have a loaded Fighting Utility for this purpose, even if the ICE has no attack capability!)</p>`;
  } else if (myid=='HIDE FROM ICE/PERSONA') {
    return `<h3>HIDE FROM ICE/PERSONA</h3>
<p>Requirements: Stealth Utility</p>
<p>An operator can try to sneak past ICE and even hide from other personas. To do this they must succeed on a Hacking roll. If the ICE or persona is actively looking for an intruder, this becomes an opposed roll. ICE rolls its Rating, other personas their Hacking.</p>`;
  } else if (myid=='IMPROVISE A UTILITY') {
    return `<h3>IMPROVISE A UTILITY</h3>
<p>Requirements: —</p>
<p>As an action an operator may hastily cobble together a rough piece of code to improvise a Utility they don’t have. See Utilities for details (page 43).</p>`;
  } else if (myid=='JACK OUT') {
    return `<h3>JACK OUT</h3>
<p>Requirements: —</p>
<p>To jack out without suffering dumpshock the operator doesn’t have to roll, but it takes an action. An operator may jack out without caring about dumpshock as a free action, but they need to succeed on a Vigor roll –2 or suffer 1 level of Dumpshock Fatigue. When fighting Black ICE this does not apply, see Black ICE on page 41 for details.</p>`;
  } else if (myid=='LOAD/END UTILITY') {
    return `<h3>LOAD/END UTILITY</h3>
<p>Requirements: —</p>
<p>Loading/ending Utilities does not require a roll, but takes an action. Loading and ending Utilities can be done with the same action. An operator can load a number of new Utilities into the RAM equal to the Loading Speed of their deck. They can end any number of Utilities. An operator can’t have more Utilities loaded than the RAM of their cyberdeck.</p>`;
  } else if (myid=='SEARCH FOR A SYSTEM WITH AN UNKNOWN ADDRESS') {
    return `<h3>SEARCH FOR A SYSTEM WITH AN UNKNOWN ADDRESS</h3>
<p>Requirements: —</p>
<p>Public Access Nodes can be found via directory listings (it takes [[/r 1d6]] rounds to actually get there, if time is important).</p>
<p>To find a Hidden Access Node the operator must know one exists and succeed on a Research roll with the Access Node’s System Toughness as the target number. This roll can be repeated once with a –2 penalty. After that, the operator had better know somebody who can sell them the Node’s address or act as a guide.</p>`;
  } else if (myid=='ACCESS ENCRYPTED DATA') {
    return `<h3>ACCESS ENCRYPTED DATA</h3>
<p>Requirements: varying</p>
<p>The operator may either try to decrypt the data, or outright a�ack the Scramble ICE.</p>
<p>Decrypting the data requires the Decrypt Utility. The operator needs a successful Hacking roll, with the ICE’s Toughness as the target number. Decrypting the data takes [[/r 2d4]] rounds. Every raise on the roll lowers this number by 1, to a minimum of 1 round. If the operator fails the ICE may raise the alarm, delete the data, activate additional ICE, or any combination thereof.</p>
<p>Attacking the ICE requires the Fighting Utility. The operator has to perform a normal attack against the Scramble ICE. If the attack misses or doesn’t inflict enough damage to Shake or destroy it, the ICE may take action as noted above. If the attack shakes the ICE it must Unshake first before it can take any further action. If the attack succeeds and inflicts 1 or more Wounds, the ICE crashes and the data can be accessed.</p>`;
  } else if (myid=='DECEIVE ICE') {
    return `<h3>DECEIVE ICE</h3>
<p>Requirements: Persuasion Utility</p>
<p>To gain access to a Node protected by Access ICE the operator must succeed in an opposed roll with their Hacking skill against the ICE’s Rating. Grey ICE can be deceived also, if the Node hasn’t flagged the operator as hostile yet.
ICE only has to be deceived once. It will only require a new identification (and therefore another roll) if the Alarm Status changes, or it is instructed by an administrator to re-check everyone. Barrier ICE and Black ICE can’t be deceived.</p>`;
  } else if (myid=='EDIT/COPY/ERASE DATA') {
    return `<h3>EDIT/COPY/ERASE DATA</h3>
<p>Requirements: —</p>
<p>This requires a successful Hacking roll against the System Toughness.</p>`;
  } else if (myid=='MANIPULATE A DEVICE PORT') {
    return `<h3>MANIPULATE A DEVICE PORT</h3>
<p>Requirements: —</p>
<p>Devices like cameras, factory machines, doors, or even coffee makers in meat-space may be controlled via cyberspace. These devices are connected to Nodes via ports. A successful Hacking roll against the System Toughness allows the operator to manipulate or control a port. They can deactivate the port, see what kind of device is connected, even dump an enemy operator if a cyberterminal or cyberdeck is connected to cyberspace with this particular port. The dumped operator needs to succeed on a Vigor roll –2 or suffer 1 level of Dumpshock Fatigue. The operator can also control the device attached to the port.</p>`;
  }

}

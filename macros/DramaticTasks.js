const version = 'v1.2';
const sm = game.modules.get('swademacros')?.api.sm;

const chatimage = 'icons/commodities/tech/detonator-timer.webp';
const challengeTrackerFlag = sm.isModuleOn("challenge-tracker");

main();

function main() {  
  let challengeTrackerHTML='';
  if (challengeTrackerFlag) {
    challengeTrackerHTML = 'checked';
  }
  let template =`
<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;}
.tg td{border-color:black;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;
  overflow:hidden;padding:10px 5px;word-break:normal;}
.tg th{border-color:black;border-style:solid;border-width:0px;font-family:Arial, sans-serif;font-size:14px;
  font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
.tg .tg-xwyw{border-color:#000000;text-align:center;vertical-align:middle}
.tg .tg-0lax{border-color:#000000;text-align:center;vertical-align:middle}
</style>

<table class="tg">
<tbody>
  <tr>
    <td class="tg-xwyw">
        <b>Players</b>
        <p>
          <select id="playersAmount" name="playersAmount">
            <option value="1" selected="selected">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select> 
        </p>
    </td>
    <td class="tg-0lax">
      <b>Difficult</b>
      <p>
      <select id="difficult" name="difficult">
        <option value="challenging" selected="selected">Challenging</option>
        <option value="difficult">Difficult</option>
        <option value="complex">Complex</option>
      </select>  
      </p>
    </td>
  </tr>

  <tr>
    <td class="tg-xwyw" colspan="2">
      <h3>Custom</h3>
      <p>Only change below if you want to customize.</p>
    </td>
  </tr>

  <tr>
    <td class="tg-xwyw">
        <b>Tokens</b>
        <p>
          <input id="customTokens" type="number" min="1" max="100" value="0">    
        </p>
    </td>
    <td class="tg-0lax">
      <b>Turns</b>
      <p>
        <input id="customTurns" type="number" min="1" max="100" value="0">    
      </p>
    </td>
  </tr>

  <tr>
    <td class="tg-xwyw" colspan="2">
      <h3><b>Options</b></h3>
    </td>
  </tr>
  
  <tr>
    <td class="tg-xwyw">
      <b>Challenge Tracker</b>
    </td>
    <td class="tg-xwyw">
      <input id="challengeTracker" type="checkbox" ${challengeTrackerHTML}>
    </td>    
  </tr>
  
</tbody>
</table>
`;
  
  new Dialog({
    title: `Dramatic Task - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "Guess!",
        callback: async (html) => {
          dramaticTask(html);
        },
      },
      cancel: {
        label: "Cancel",
      }
    },
    default: "ok"
  }, {}).render(true);
}


async function dramaticTask(html) {
  const players = html.find("#playersAmount")[0].value;    
  const difficult = html.find("#difficult")[0].value;      
  const customTokens = html.find("#customTokens")[0].value;    
  const customTurns = html.find("#customTurns")[0].value;      
  const challengeTracker = html.find("#challengeTracker")[0].value;      
  
  let message=``;
  message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Dramatic Tasks</h2>`;      

  if ( customTokens!=0 && customTurns!=0 ) {
    message += customDramaticTask(customTokens, customTurns, challengeTracker);
  } else {
    message += calculateTaskTokens(players, difficult, challengeTracker);
  }

  // send message
  let chatData = {
    content: message,
    whisper : ChatMessage.getWhisperRecipients("GM")
  };
  ChatMessage.create(chatData, {}); 
}

function calculateTaskTokens(players, difficult, challengeTracker=false) {
  let tasksTokens=0;
  let tasksTurns=0;
  let difficultName='';
  let message=``;
  if (difficult=='challenging') {
    tasksTokens=players*4;    
    tasksTurns=3;
    difficultName='Challenging';
  } else if (difficult=='difficult') {
    tasksTokens=players*6;    
    tasksTurns=4;
    difficultName='Difficult';
  } else if (difficult=='complex') {
    tasksTokens=players*8;
    tasksTurns=5;
    difficultName='Complex';
  }
  message+=`<p>This is <b>${difficult}</b> for <b>${players}</b> player(s).</p>`;
  message+=`<ul><li>Task Tokens: <b style="color:red;">${tasksTokens}</b></li><li>Rounds: <b style="color:red;">${tasksTurns}</b></p>`;
  
  if (challengeTracker) {
    ChallengeTracker.open(tasksTokens, tasksTurns);
  }  
  
  return message;
}

function customDramaticTask(tokens, turns, challengeTracker=false) {
  let message=``;
  message+=`<ul><li>Task Tokens: <b style="color:red;">${tokens}</b></li><li>Rounds: <b style="color:red;">${turns}</b></p>`;
  
  if (challengeTracker) {
    ChallengeTracker.open(tokens, turns);
  }
  
  return message;
}


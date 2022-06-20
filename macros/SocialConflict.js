const version = 'v1.0';
const sm = game.modules.get('swademacros')?.api.sm;

const chatimage = 'icons/skills/social/trading-justice-scale-yellow.webp';
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
        <b>Tokens</b>
        <p>
          <input id="customTokens" type="number" min="1" max="100" value="6">    
        </p>
    </td>
    <td class="tg-0lax">
      <b>Turns</b>
      <p>
        <input id="customTurns" type="number" min="1" max="100" value="3">    
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
    title: `Social Conflict - ${version}`,
    content: template,
    buttons: {
      ok: {
        label: "Run!",
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
  const customTokens = html.find("#customTokens")[0].value;    
  const customTurns = html.find("#customTurns")[0].value;      
  const challengeTracker = html.find("#challengeTracker")[0].value;      
  
  let message=``;
  message = `<h2><img style="vertical-align:middle" src=${chatimage} width="28" height="28"> Social Conflict</h2>`;      

  message += customSocialConflict(customTokens, customTurns, challengeTracker);


  // send message
  let chatData = {
    content: message,
    whisper : ChatMessage.getWhisperRecipients("GM")
  };
  ChatMessage.create(chatData, {}); 
}

function customSocialConflict(tokens, turns, challengeTracker=false) {
  let message='';
  message+=`<ul><li>Task Tokens: <b style="color:red;">${tokens}</b></li><li>Rounds: <b style="color:red;">${turns}</b></p>`;
  
  if (challengeTracker) {
    ChallengeTracker.open(tokens, turns);
  }
  
  return message;
}



const iconSize = 45;
const icon = 'icons/skills/movement/arrow-upward-yellow.webp';
const failureIcon = 'icons/magic/death/bones-crossed-orange.webp';
const successIcon = 'icons/skills/social/trading-justice-scale-yellow.webp';
const raisesIcon = 'icons/skills/social/peace-luck-insult.webp';
const text = `<div>
  <img style="vertical-align:middle" src="${icon}" alt="" width="${iconSize}" height="${iconSize}" /> 
  <span>Raises will show here once you leave the Result field.</span>
</div>`;  


new Dialog({
  title: 'Raise Calculator',
  content: `
    <style type="text/css">
    .tg  {border-collapse:collapse;border-spacing:0;height:200px;}
    .tg td{border-color:black;border-style:solid;border-width:0px; width:60px;
      overflow:hidden;padding:10px 5px;word-break:normal;}
    .tg th{border-color:black;border-style:solid;border-width:0px;
      font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
    .tg .tg-xwyw{border-color:#000000;text-align:center;vertical-align:middle}
    </style>

    <form>

    <table class="tg">
    <tbody>
      <tr>
        <td class="tg-xwyw">
          <b style="font-size:20px">Target Number</b>
        </td>
        <td class="tg-xwyw">
          <b style="font-size:20px">Result</b>
        </td>
      </tr>
      <tr>
        <td class="tg-xwyw">
          <div class="form-group">
            <input name="target" type="number" min="0" max="200" value=4 autofocus onClick="this.select();" style="width: 50px;"/>
          </div>                  
        </td>
        <td class="tg-xwyw">
          <div class="form-group"> 
            <input name="result" type="number" min="0" max="200" onClick="this.select();" style="width: 50px;"/>
          </div>        
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <div class="calculation">${text}</div>
        </td>
      </tr>
    </tbody>
    </table>

    </form>`,
  buttons: {},
  render: ([dialogContent]) => {
    
    dialogContent.querySelector(`input[name="target"`).focus();
    dialogContent.querySelector(`input[name="result"`).addEventListener("input", (event) => {
        const textInput = event.target;
        const form = textInput.closest("form")
        const calcResult = form.querySelector(".calculation");
        const target = form.querySelector('input[name="target"]').value;
        const result = form.querySelector('input[name="result"]').value;
        let raises = Math.floor((parseInt(result) - parseInt(target)) / 4);
        let tmpIcon;
        
        if (parseInt(target) > parseInt(result)) {
          tmpIcon = failureIcon;
          calcResult.innerHTML = `<div>
          <img style="vertical-align:middle" src="${tmpIcon}" alt="" width="${iconSize}" height="${iconSize}" /> 
          <span style="font-size:20px"><b>Failure</b></span>
          </div>`;
        }
        else if (parseInt(target) <= parseInt(result) && raises < 1) {
          tmpIcon = successIcon;
          calcResult.innerHTML = `<div>
          <img style="vertical-align:middle" src="${tmpIcon}" alt="" width="${iconSize}" height="${iconSize}" /> 
          <span style="font-size:20px"><b>Success</b></span>
          </div>`;          
        }
        else {
          tmpIcon = raisesIcon;
          calcResult.innerHTML = `<div>
          <img style="vertical-align:middle" src="${tmpIcon}" alt="" width="${iconSize}" height="${iconSize}" /> 
          <span style="font-size:20px"><b>${raises} Raise(s)</b></span>
          </div>`;      
        }
        
      });
      
  },
}).render(true);

const version = '1.0';
const iconSize = 45;
const icon = 'icons/environment/wilderness/portal.webp';
const text = `<div>
  <img style="vertical-align:middle" src="${icon}" alt="" width="${iconSize}" height="${iconSize}" /> 
  <span>The result will show here.</span>
</div>`;  


new Dialog({
  title:`Travel - ${version}`,
  content: `
    <style type="text/css">
    .tg  {border-collapse:collapse;border-spacing:0;height:200px;}
    .tg td{border-color:black;border-style:solid;border-width:0px; width:60px;
      overflow:hidden;padding:10px 5px;word-break:normal;}
    .tg th{border-color:black;border-style:solid;border-width:0px;
      font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
    .tg .tg-xwyw{border-color:#000000;text-align:center;vertical-align:middle}
    </style>

    <p>You need to use the same unit for everything.</p>

    <form>

    <table class="tg">
    <tbody>
      <tr>
        <td class="tg-xwyw">
          <b style="font-size:20px">Distance</b>
        </td>
        <td class="tg-xwyw">
          <b style="font-size:20px">Speed</b>
        </td>
        <td class="tg-xwyw">
          <b style="font-size:20px">Time</b>
        </td>        
      </tr>
      <tr>
        <td class="tg-xwyw">
          <div class="form-group">
            <input name="distance" type="number" min="0" max="200" value=80 autofocus onClick="this.select();" style="width: 50px;"/>
          </div>                  
        </td>
        <td class="tg-xwyw">
          <div class="form-group"> 
            <input name="speed" type="number" min="0" max="200" value=80 onClick="this.select();" style="width: 50px;"/>
          </div>        
        </td>
        <td class="tg-xwyw">
          <div class="form-group"> 
            <input name="time" type="number" min="0" max="200" value=3 onClick="this.select();" style="width: 50px;"/>
          </div>        
        </td>        
      </tr>
      <tr>
        <td colspan="3">
          <div class="calculation">${text}</div>
        </td>
      </tr>
    </tbody>
    </table>

    </form>`,
  buttons: {},
  render: ([dialogContent]) => {
    
    dialogContent.querySelector(`input[name="distance"`).focus();
    
    dialogContent.querySelector(`input[name="distance"`).addEventListener("input", (event) => {
        const textInput = event.target;
        const form = textInput.closest("form")
        const calcResult = form.querySelector(".calculation");
        
        const distance = form.querySelector('input[name="distance"]').value;
        const speed = form.querySelector('input[name="speed"]').value;
        const time = form.querySelector('input[name="time"]').value;

        calcResult.innerHTML = outputMath(distance, speed, time);
      });

    dialogContent.querySelector(`input[name="speed"`).addEventListener("input", (event) => {
        const textInput = event.target;
        const form = textInput.closest("form")
        const calcResult = form.querySelector(".calculation");
        
        const distance = form.querySelector('input[name="distance"]').value;
        const speed = form.querySelector('input[name="speed"]').value;
        const time = form.querySelector('input[name="time"]').value;

        calcResult.innerHTML = outputMath(distance, speed, time);
      });

    dialogContent.querySelector(`input[name="time"`).addEventListener("input", (event) => {
        const textInput = event.target;
        const form = textInput.closest("form")
        const calcResult = form.querySelector(".calculation");
        
        const distance = form.querySelector('input[name="distance"]').value;
        const speed = form.querySelector('input[name="speed"]').value;
        const time = form.querySelector('input[name="time"]').value;

        calcResult.innerHTML = outputMath(distance, speed, time);
      });


  },
}).render(true);

function outputMath(distance, speed, time) {
  let message=`<div>
    <img style="vertical-align:middle" src="${icon}" alt="" width="${iconSize}" height="${iconSize}" /> 
    <span style="font-size:14px">`;
  message += `Distance: ${deltaDistance(distance, time)} / `;
  message += `Speed: ${deltaSpeed(distance, time)} / `;
  message += `Time: ${deltaTime(speed, distance)}`;  
  
  message += `</b></span></div>`;        
  return message;
}

function deltaDistance(distance, time) {
  return Math.round( distance*time );  
}

function deltaSpeed(distance, speed) {
  return Math.round( distance/speed );  
}

function deltaTime(speed, distance) {
  return Math.round( distance/speed );  
}
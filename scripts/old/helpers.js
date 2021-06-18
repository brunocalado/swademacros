/*******************************************************
 * HELPER FUNCTIONS TO PROCESS THE LOGIC OF THE MODULE *
 *******************************************************/

//import { hello } from './macros/debug.js';

class macroHelper {
  
  async debugMessage(message) {
    console.log(message);
  }

  async debugMessage2() {
    hello();
  }
  
  async build_helper() {  
    let pack = game.packs.get('swademacros.macros-for-swade');
    let content = await pack.getDocuments();
    
    for(let macro of content) {
      macroHelper[macro.data.name] = async function() { macro.execute() }      
    }
  }
  
  async macroRun(macroName) {  
    let pack = game.packs.get('swademacros.macros-for-swade');
    let macro = ( await pack.getDocuments() ).find(i => (i.data.name==macroName) );
    macro.execute();    
  }
  
} // end

// _macroHelper.Chase();
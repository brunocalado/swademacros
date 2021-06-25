/*******************************************************
 * HELPER FUNCTIONS TO PROCESS THE LOGIC OF THE MODULE *
 *******************************************************/

class macroHelper {
  
  static async macroRun(macroName) {  
    let pack = game.packs.get('swademacros.macros-for-swade');
    let macro = ( await pack.getDocuments() ).find(i => (i.data.name==macroName) );
    await macro.execute();    
  }
  
}
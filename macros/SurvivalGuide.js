//icon: icons/magic/symbols/star-solid-gold.webp
let compendiumName2 = 'swademacros.guide-macros-for-swade';
let pack = game.packs.get(compendiumName2);
let content = await pack.getDocuments();
let guide = content.find( i => (i.data.name === 'Survival Guide') );
guide.sheet.render(true);
ui.notifications.info('Attach template to your token!')

async function TemplateAttach() {
    const templateID = canvas.templates.placeables[canvas.templates.placeables.length - 1].data._id;
    let template = await canvas.templates.get(templateID);
    let target_token = canvas.tokens.placeables.find(i => i.center.x === template.center.x && i.center.y === template.center.y);
    tokenAttacher.attachElementToToken(template, target_token)
}
TemplateAttach();




if you weren't using midi (:smirk:) you could just write the item macro like this:
ui.notifications.info('Attach template to your token!')
await item.roll();
async function TemplateAttach() {
    const templateID = canvas.templates.placeables[canvas.templates.placeables.length - 1].data._id;
    let template = await canvas.templates.get(templateID);
    let target_token = canvas.tokens.placeables.find(i => i.center.x === template.center.x && i.center.y === template.center.y);
    tokenAttacher.attachElementToToken(template, target_token)
}
TemplateAttach();
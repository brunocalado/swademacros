(async () => {
  let br_card = await game.brsw.create_atribute_card(token, 'spirit');
  const r = game.brsw.roll_attribute(br_card, '', false);
})();

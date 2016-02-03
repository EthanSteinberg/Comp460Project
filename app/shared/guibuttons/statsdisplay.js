export function statsDisplay(x, y, stats, context, images) {
  context.drawImage(images.stats, x, y, 210, 210);
  context.font = '15px Comic Sans MS';
  context.textAlign = 'end';
  context.fillStyle = 'black';
  context.fillText(stats.health, x + 150, y + 10);
  context.fillText(stats.damage, x + 150, y + 30);
  context.fillText(stats.speed, x + 150, y + 52);
  context.fillText(stats.weight, x + 150, y + 74);
  context.fillText(stats.wcost, x + 150, y + 94);
  context.fillText(stats.ccost, x + 150, y + 114);
  context.fillText(stats.tcost, x + 150, y + 150);

  context.textAlign = 'start';
}

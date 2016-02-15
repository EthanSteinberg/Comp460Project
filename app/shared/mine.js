/**
 * A mine entity.
 */

export function createMine(map, x, y, islandID, team) {
  const mine = {
    type: 'mine',
    x,
    y,
    id: map.getNextEntityId(),
    islandID,
    team,
  };

  map.addEntity(mine);

  return mine.id;
}

export function processUpdate(mine, map) {
  map.getEntity(mine.team).coins += 0.2;
}

export function render(mine, map, context, images, isSelected) {
  if (mine.team === '1') {
    context.fillStyle = 'firebrick';
  } else {
    context.fillStyle = 'royalblue';
  }

  context.beginPath();
  context.arc(mine.x * 50, mine.y * 50, 25, 0, Math.PI * 2, true);
  context.fill();

  context.drawImage(images.mine, (mine.x - 0.5) * 50, (mine.y - 0.5) * 50, 50, 50);

  if (isSelected) {
    context.strokeStyle = 'cyan';
    context.strokeRect(
      (this.x - 0.5) * 50,
      (this.y - 0.5) * 50,
      50,
      50
    );
  }
}

/**
 * A mine entity.
 */

export function createMine(map, x, y, islandID) {
  const mine = {
    type: 'mine',
    x,
    y,
    id: map.getNextEntityId(),
    islandID,
  };

  map.addEntity(mine);

  return mine.id;
}

export function processUpdate(mine, map) {
  map.getEntity('0').coins += 0.2;
}

export function render(mine, map, context, images, isSelected) {
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

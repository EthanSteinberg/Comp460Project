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
    health: 100,
  };

  map.addEntity(mine);

  return mine.id;
}

export function processUpdate(mine, map) {
  map.getEntity(mine.team).coins += 0.2;
}

export function heal(mine, map) {
  if (mine.health < 100) {
    mine.health += 5
  }
}

export function render(mine, map, renderList, isSelected) {
  const name = (mine.team === '1') ? 'pirateCircle' : 'imperialCircle';

  renderList.addImage(name, mine.x * 50 - 25, mine.y * 50 - 25);

  renderList.addImage('mine2', (mine.x - 0.5) * 50, (mine.y - 0.5) * 50, 50, 50);

  renderList.addImage('black', mine.x * 50 - 22, mine.y * 50 + 28, 44, 9);

  renderList.addImage('red', mine.x * 50 - 20, mine.y * 50 + 30, 40, 5);

  const healthpercent = mine.health / 100;

  renderList.addImage('green', mine.x * 50 - 20, mine.y * 50 + 30, 40 * healthpercent, 5);

  if (isSelected) {
    renderList.addImage('cyan',
      (this.x - 0.5) * 50,
      (this.y - 0.5) * 50,
      50,
      50
    );
  }
}

export function getPosition(mine) {
  return { x: mine.x, y: mine.y };
}

export function remove(mine, map) {
  map.removeEntity(mine.id);
}

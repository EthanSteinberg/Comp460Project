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
    renderHeal: false,
    healTimer: 2,
  };

  map.addEntity(mine);

  return mine.id;
}

export function processUpdate(mine, map) {
  map.getEntity(mine.team).coins += 0.2;
}

export function heal(mine, map) {
  if (mine.healTimer > 0) {
    mine.healTimer -= 1
    return;
  } else {
    mine.healTimer = 2
  }

  if (mine.health < 100) {
    mine.health += 5
    mine.renderHeal = true
  } else {
    mine.renderHeal = false;
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

  if (mine.renderHeal) {
    var randomX = Math.floor(Math.random()*(50 - (-5) + 1) + -5);
    var randomY = Math.floor(Math.random()*(50 - (-5) + 1) + -5);
    renderList.addImage('cross', (mine.x - 0.5) * 50 + randomX , (mine.y - 0.5) * 50 + randomY, 10, 10);
  }
}

export function getPosition(mine) {
  return { x: mine.x, y: mine.y };
}

export function remove(mine, map) {
  map.removeEntity(mine.id);
}

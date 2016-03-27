import { hardpoints } from './template';
import * as Ships from './ship';
import * as Projectiles from './projectile';

const gun1Position = {
  x: 0,
  y: -15.75 / 50,
};

const gun2Position = {
  x: 0,
  y: 13.25 / 50,
};

const gunPositions = [
  gun1Position,
  gun2Position,
];

export function createHardpoint(map, shipId, index, gunType, team) {
  const point = {
    id: map.getNextEntityId(),
    type: 'hardpoint',
    gunType,
    timeTillNextFire: 0,
    shipId,
    offset: gunPositions[index],
    index,
    team,

    radius: 5.625 / 50,
  };

  map.addEntity(point);

  return point.id;
}

// export function render(hardpoint, map, renderList) {
//   const { x, y } = getPosition(hardpoint, map);

//   renderList.addImage('cannon', x * 50 - 20 / 4, y * 50 - 25 / 4, 10, 10);
// }

export function renderTemplate(hardpoint, slotnum, x, y, renderList) {
  let modifier = 0;
  if (slotnum === 1) {
    modifier = 20;
  }

  renderList.addImage('linen', x + modifier, y, 10, 10);

  switch (hardpoint) {
    case 'roundshot':
      renderList.addImage('roundshot', x + modifier, y, 10, 10);
      break;
    case 'grapeshot':
      renderList.addImage('grapeshot', x + modifier, y, 10, 10);
      break;
    case 'chainshot':
      renderList.addImage('chainshot', x + modifier, y, 10, 10);
      break;
    case 'shell':
      renderList.addImage('shell', x + modifier, y, 10, 10);
      break;
  }
}

export function getPosition(hardpoint, map) {
  const ship = map.getEntity(hardpoint.shipId);

  const x = ship.x + Math.cos(Ships.getOrientation(ship)) * hardpoint.offset.x - Math.sin(Ships.getOrientation(ship)) * hardpoint.offset.y;
  const y = ship.y + Math.sin(Ships.getOrientation(ship)) * hardpoint.offset.x + Math.cos(Ships.getOrientation(ship)) * hardpoint.offset.y;
  return { x, y };
}

export function fire(hardpoint, map, target) {
  const position = getPosition(hardpoint, map);

  Projectiles.createProjectile(map, position, target, hardpoint.gunType, hardpoint.shipId);

  hardpoint.timeTillNextFire = 100;
}

export function processUpdate(hardpoint) {
  if (hardpoint.timeTillNextFire !== 0) {
    hardpoint.timeTillNextFire -= 1;
  }
}

export function remove(hardpoint, map) {
  map.removeEntity(hardpoint.id);
}

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

export function render(hardpoint, map, context, images) {
  const { x, y } = getPosition(hardpoint, map);

  context.drawImage(images.cannon, x * 50 - 20 / 4, y * 50 - 25 / 4, 10, 10);
}

export function renderTemplate(hardpoint, slotnum, x, y, context, images) {
  var modifier = 0;
  if (slotnum == 1) {
    modifier = 20;
  }

  context.fillStyle = 'coral';
  context.fillRect(x + modifier, y, 10, 10);    

  switch (hardpoint) {
    case 'roundshot':
      context.drawImage(images.roundshot, x + modifier, y, 10, 10);
      break;
    case 'grapeshot':
      context.drawImage(images.grapeshot, x + modifier, y, 10, 10);
      break;
    case 'chainshot':
      context.drawImage(images.chainshot, x + modifier, y, 10, 10);
      break;
    case 'shell':
      context.drawImage(images.shell, x + modifier, y, 10, 10);
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

  Projectiles.createProjectile(map, position, target, hardpoint.gunType);

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

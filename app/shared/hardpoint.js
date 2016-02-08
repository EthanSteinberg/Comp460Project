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

export function createHardpoint(map, shipId, index, gunType) {
  const point = {
    id: map.getNextEntityId(),
    type: 'hardpoint',
    gunType,
    health: hardpoints[gunType].health,
    timeTillNextFire: 0,
    shipId,
    offset: gunPositions[index],
    index,

    radius: 5.625 / 50,
  };

  map.addEntity(point);

  return point.id;
}

export function render(hardpoint, map, context, images) {
  const { x, y } = getPosition(hardpoint, map);

  context.drawImage(images.cannon, x * 50 - 20 / 4, y * 50 - 25 / 4, 10, 10);

  context.fillStyle = 'red';
  context.fillRect(x * 50 - 10, y * 50 + 5, 20, 5);

  const healthpercent = hardpoint.health / hardpoints[hardpoint.gunType].health;

  context.fillStyle = 'green';
  context.fillRect(x * 50 - 10, y * 50 + 5, 20 * healthpercent, 5);

  context.strokeStyle = 'black';
  context.strokeRect(x * 50 - 10, y * 50 + 5, 20, 5);
}

export function getPosition(hardpoint, map) {
  const ship = map.getEntity(hardpoint.shipId);

  const x = ship.x + Math.cos(Ships.getOrientation(ship)) * hardpoint.offset.x - Math.sin(Ships.getOrientation(ship)) * hardpoint.offset.y;
  const y = ship.y + Math.sin(Ships.getOrientation(ship)) * hardpoint.offset.x + Math.cos(Ships.getOrientation(ship)) * hardpoint.offset.y;
  return { x, y };
}

export function fire(hardpoint, map, target) {
  const position = getPosition(hardpoint, map);

  Projectiles.createProjectile(map, position, target);

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

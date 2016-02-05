import { hardpoints } from './template';
import * as Ships from './ship';

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
    stats: {
      health: hardpoints[gunType].health,
      timeTillNextFire: 0,
    },
    shipId,
    offset: gunPositions[index],
    index,

    radius: 5.625 / 50,

    isSelected: false,
  };

  map.addEntity(point);

  return point.id;
}

export function render(hardpoint, map, context, images) {
  const { x, y } = getPosition(hardpoint, map);

  context.drawImage(images.cannon, x * 50 - 15 / 4, y * 50 - 25 / 4, 10, 10);

  context.fillStyle = 'red';
  context.fillRect(x * 50 - 10, y * 50 + 5, 20, 5);

  const healthpercent = hardpoint.stats.health / hardpoints[hardpoint.gunType].health;

  context.fillStyle = 'green';
  context.fillRect(x * 50 - 10, y * 50 + 5, 20 * healthpercent, 5);

  context.strokeStyle = 'black';
  context.strokeRect(x * 50 - 10, y * 50 + 5, 20, 5);
}

function getPosition(hardpoint, map) {
  const ship = map.getEntity(hardpoint.shipId);

  const x = ship.x + Math.cos(Ships.getOrientation(ship)) * hardpoint.offset.x - Math.sin(Ships.getOrientation(ship)) * hardpoint.offset.y;
  const y = ship.y + Math.sin(Ships.getOrientation(ship)) * hardpoint.offset.x + Math.cos(Ships.getOrientation(ship)) * hardpoint.offset.y;
  return { x, y };
}

export default class Hardpoint {
  constructor(ship, offset, index, gunType, map) {
    this.type = 'hardpoint';
    this.gunType = gunType;
    this.map = map;

    this.stats = {
      health: hardpoints[this.gunType].health,
      timeTillNextFire: 0,
    };

    this.ship = ship;
    this.offset = offset;
    this.id = nextId++;
    this.radius = 5.625 / 50;
    this.isSelected = false;

    this.index = index;

    this.map.addHardpoint(this);
  }

  getPosition() {
    const x = this.ship.getX() + Math.cos(this.ship.getOrientation()) * this.offset.x - Math.sin(this.ship.getOrientation()) * this.offset.y;
    const y = this.ship.getY() + Math.sin(this.ship.getOrientation()) * this.offset.x + Math.cos(this.ship.getOrientation()) * this.offset.y;
    return { x, y };
  }

  render(context, images) {
    const { x, y } = this.getPosition();

    context.drawImage(images.cannon, x * 50 - 20 / 4, y * 50 - 25 / 4, 10, 10);

    context.fillStyle = 'red';
    context.fillRect(x * 50 - 10, y * 50 + 5, 20, 5);

    const healthpercent = this.stats.health / hardpoints[this.gunType].health;

    context.fillStyle = 'green';
    context.fillRect(x * 50 - 10, y * 50 + 5, 20 * healthpercent, 5);

    context.strokeStyle = 'black';
    context.strokeRect(x * 50 - 10, y * 50 + 5, 20, 5);


    if (this.isSelected) {
      context.strokeStyle = 'cyan';
      context.beginPath();
      context.arc(this.getPosition().x * 50, this.getPosition().y * 50, this.radius * 50, 0, Math.PI * 2, true);
      context.stroke();
    }
  }

  getTimeTillFire() {
    return this.stats.timeTillNextFire;
  }

  getHealth() {
    return this.stats.health;
  }

  getType() {
    return this.type;
  }

  getId() {
    return this.id;
  }

  getIndex() {
    return this.index;
  }

  fire(targetId) {
    const projectileId = this.map.getNextProjectileId();
    const position = this.getPosition();

    this.map.getProjectiles().set(projectileId, { position, targetId });

    this.stats.timeTillNextFire = 100;
    return [
      { type: 'SetWeaponCooldown', shipId: this.ship.getId(), hardpointId: this.id, timeTillNextFire: this.stats.timeTillNextFire },
      { type: 'AddProjectile', id: projectileId, position },
    ];
  }

  setTimeTillNextFire(timeTillNextFire) {
    this.stats.timeTillNextFire = timeTillNextFire;
  }

  getUpdateMessages() {
    if (this.stats.timeTillNextFire !== 0) {
      this.stats.timeTillNextFire -= 1;
      return [{ type: 'SetWeaponCooldown', shipId: this.ship.getId(), hardpointId: this.id, timeTillNextFire: this.stats.timeTillNextFire }];
    }

    return [];
  }
}

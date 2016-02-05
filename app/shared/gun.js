import { hardpoints } from './template';

export default class Gun {
  constructor(ship, offset, id, gunType, map) {
    this.type = 'gun';
    this.gunType = gunType;
    this.map = map;

    this.stats = {
      health: hardpoints[this.gunType].health,
      timeTillNextFire: 0,
    };

    this.ship = ship;
    this.offset = offset;
    this.id = id;
    this.radius = 5.625 / 50;
    this.isSelected = false;
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

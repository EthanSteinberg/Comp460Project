const shipMoveSpeed = 0.05;

import astar from '../shared/astar';
import { hulls } from './template';
import Gun from './gun';

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

/**
 * A ship entity.
 */
let nextId = 0;

export default class Ship {

  constructor(map, x, y, template) {
    // Both
    this.map = map;
    this.x = x;
    this.y = y;
    this.id = nextId++;
    this.type = 'ship';
    this.template = template;

    this.stats = JSON.parse(JSON.stringify(hulls[this.template.hull]));

    this.hardpoints = this.template.hardpoints.map((hardpoint, index) => {
      if (hardpoint == null) {
        return null;
      }

      return new Gun(this, gunPositions[index], index, hardpoint, this.map);
    });

    this.lastDx = 0;
    this.lastDy = -1;


    // Server side
    this.mode = {
      type: 'IDLE',
    };

    // Client side

    this.isSelected = false;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  getOrientation() {
    return Math.atan2(this.lastDy, this.lastDx) + Math.PI / 2;
  }

  render(context, images) {
    context.save();
    context.translate(this.x * 50, this.y * 50);

    const angle = this.getOrientation();

    context.rotate(angle);
    context.drawImage(images.ship, (-0.5) * 50, (-0.5) * 50, 50, 50);
    context.restore();

    context.fillStyle = 'red';
    context.fillRect(this.x * 50 - 20, this.y * 50 + 30, 40, 5);

    const healthpercent = this.stats.health / hulls[this.template.hull].health;

    context.fillStyle = 'green';
    context.fillRect(this.x * 50 - 20, this.y * 50 + 30, 40 * healthpercent, 5);

    context.strokeStyle = 'black';
    context.strokeRect(this.x * 50 - 20, this.y * 50 + 30, 40, 5);

    if (this.isSelected) {
      context.strokeStyle = 'cyan';
      context.beginPath();
      context.arc(this.x * 50, this.y * 50, 25, 0, Math.PI * 2, true);
      context.stroke();
    }

    if (this.attackShown != null) {
      const enemyShip = this.map.getShip(this.attackShown);

      context.strokeStyle = 'red';
      context.beginPath();
      context.moveTo(this.getX() * 50, this.getY() * 50);
      context.lineTo(enemyShip.getX() * 50, enemyShip.getY() * 50);
      context.stroke();
    }

    for (const hardpoint of this.hardpoints) {
      hardpoint.render(context, images);
    }
  }

  getHardpointById(hardPointId) {
    return this.hardpoints[hardPointId];
  }

  getHardpoints() {
    return this.hardpoints;
  }

  getHardpoint(x, y) {
    const position = { x, y };

    for (const hardpoint of this.hardpoints) {
      if (this.getDistance(position, hardpoint.getPosition()) <= hardpoint.radius) {
        return hardpoint;
      }
    }

    return null;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getTemplate() {
    return this.template;
  }

  getStats() {
    return this.stats;
  }

  getType() {
    return this.type;
  }

  setPosition(x, y) {
    this.lastDx = x - this.x;
    this.lastDy = y - this.y;

    this.x = x;
    this.y = y;
  }

  moveTo(targetLocation) {
    const moves = this.performAStar(targetLocation);

    if (moves != null) {
      this.mode = {
        type: 'MOVING',
        moves: moves,
        moveIndex: 0,
      };
    }
  }

  attackTarget(otherShip) {
    this.mode = {
      type: 'ATTACKING',
      target: otherShip,
    };
  }

  performAStar(targetLocation) {
    const startPosition = { x: Math.round(this.getX()), y: Math.round(this.getY()) };
    const endPosition = { x: Math.round(targetLocation.x), y: Math.round(targetLocation.y) };

    const isEmpty = ({ x: tempX, y: tempY }) => {
      return !this.map.isIsland(tempX, tempY);
    };
    const isValid = ({ x: tempX, y: tempY }) => {
      return tempX >= 0 && tempX < this.map.width && tempY >= 0 && tempY < this.map.height;
    };
    const moves = astar(startPosition, endPosition, isEmpty, isValid);

    if (moves == null) {
      console.log('no such path');
      return null;
    }

    moves.splice(0, 1); // Remove the first item
    moves[moves.length - 1] = targetLocation;
    return moves;
  }

  canMove(move) {
    for (const ship of this.map.getShips()) {
      if (ship.getId() === this.id) {
        continue;
      }

      const xDistance = move.x - ship.getX();
      const yDistance = move.y - ship.getY();
      const distanceSquared = xDistance * xDistance + yDistance * yDistance;
      if (distanceSquared < 1) {
        return false;
      }

      // TODO: Need to check surrounding island borders
    }
    return true;
  }

  tryMove(move) {
    if (!this.canMove(move)) {
      return [];
    }

    this.setPosition(move.x, move.y);
    return [{ type: 'SetShipPosition', shipId: this.id, position: move }];
  }

  /**
   * Are you close enough to the current waypoint?
   */
  closeEnoughToWayPoint() {
    return this.getDistanceToTarget(this.mode.moves[this.mode.moveIndex]) <= 0.01;
  }

  getDistance(a, b) {
    const distance = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    return distance;
  }

  getDistanceToTarget(target) {
    return this.getDistance({ x: this.x, y: this.y }, target);
  }

  /**
   * Perform a move using this.mode.moveIndex and this.mode.moves.
   * Returns the move update
   */
  performMove() {
    const currentMove = this.mode.moves[this.mode.moveIndex];

    const scale = Math.min(shipMoveSpeed, this.getDistanceToTarget(currentMove));

    const move = {
      x: this.x + (currentMove.x - this.x) / this.getDistanceToTarget(currentMove) * scale,
      y: this.y + (currentMove.y - this.y) / this.getDistanceToTarget(currentMove) * scale,
    };

    return this.tryMove(move);
  }

  /**
   * Move the ship and perform the corresponding updates.
   */
  getMoveMessages() {
    if (this.mode.moveIndex === this.mode.moves.length) {
      this.mode = {
        type: 'IDLE',
      };
      return [];
    }

    if (this.closeEnoughToWayPoint()) {
      this.mode.moveIndex += 1;
    }

    if (this.mode.moveIndex === this.mode.moves.length) {
      this.mode = {
        type: 'IDLE',
      };
      return [];
    }

    return this.performMove();
  }

  /**
   * Try to attack if in range, or move into range otherwise
   */
  getAttackMessages() {
    if (this.mode.target.getHealth() <= 0) {
      this.mode = {
        type: 'IDLE',
      };

      return [];
    }

    const targetPosition = { x: this.mode.target.getX(), y: this.mode.target.getY() };

    if (this.getDistanceToTarget(targetPosition) < 2) {
      const result = [];
      for (const hardpoint of this.hardpoints) {
        if (hardpoint != null && hardpoint.getTimeTillFire() === 0) {
          result.push(...hardpoint.fire(this.mode.target.getId()));
        }
      }
      return result;
    }

    this.mode.moves = this.performAStar(targetPosition);
    if (this.mode.moves == null) {
      // No such path
      return [];
    }

    this.mode.moveIndex = 0;

    if (this.closeEnoughToWayPoint()) {
      this.mode.moveIndex += 1;
    }

    if (this.mode.moveIndex === this.mode.moves.length) {
      return [];
    }

    return this.performMove();
  }

  /**
   * Update the ship and get the corresponding update messages.
   */
  getUpdateMessages() {
    if (this.ticsNextAttack > 0) {
      this.ticsNextAttack -= 1;
    }

    const result = [];

    for (const hardpoint of this.hardpoints) {
      if (hardpoint != null) {
        result.push(...hardpoint.getUpdateMessages());
      }
    }

    switch (this.mode.type) {
      case 'MOVING':
        result.push(...this.getMoveMessages());
        break;

      case 'ATTACKING':
        result.push(...this.getAttackMessages());
        break;

      case 'IDLE':
        break;

      default:
        console.error('Unexcepted type ' + this.mode.type);
    }

    return result;
  }

  getId() {
    return this.id;
  }

  getHealth() {
    return this.stats.health;
  }

  attack(enemyShip) {
    return enemyShip.dealDamage(this.stats.damage);
  }

  dealDamage(damage) {
    this.stats.health -= damage;
    return damage;
  }

}

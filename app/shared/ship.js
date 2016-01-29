const shipMoveSpeed = 0.05;

import astar from '../shared/astar';

/**
 * A ship entity.
 */
let nextId = 0;

export default class Ship {

  constructor(map, x, y, stats) {
    this.map = map;
    this.x = x;
    this.y = y;
    this.id = nextId++;
    this.type = 'ship';
    this.isSelected = false;
    this.stats = stats;

    this.smoke1Y = 0;
    this.smoke2Y = 0;
    this.lastDx = 0;
    this.lastDy = -1;

    this.mode = {
      type: 'IDLE',
    };
  }

  render(context, images) {
    context.save();
    context.translate(this.x * 50, this.y * 50);

    const angle = Math.atan2(this.lastDy, this.lastDx) + Math.PI / 2;

    context.rotate(angle);
    context.drawImage(images.ship, (-0.5) * 50, (-0.5) * 50, 50, 50);
    context.restore();


    if (this.enemyTarget != null) {
      if (this.attackTime % 50 == 0) {
        this.smoke1Y = Math.floor((Math.random() * 35) + 1) / 100;
        this.smoke2Y = Math.floor((Math.random() * 35) + 1) / 100;

      }
      context.globalAlpha = (this.attackTime % 50) / 100;
      context.drawImage(images.smoke, (this.x - 0.25) * 50, (this.y - this.smoke1Y) * 50, 10, 10);
      context.globalAlpha = (this.attackTime % 40) / 100;
      context.drawImage(images.smoke, (this.x - 0.0) * 50, (this.y - this.smoke2Y) * 50, 10, 10);
      context.globalAlpha = 1;
    }

    if (this.isSelected) {
      context.strokeStyle = 'cyan';
      context.beginPath();
      context.arc(this.x * 50, this.y * 50, 25, 0, Math.PI * 2, true);
      context.stroke();
    }
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
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

  getDistanceToTarget(target) {
    const { x, y } = target;

    const distance = Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
    return distance;
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
    if (this.closeEnoughToWayPoint()) {
      this.mode.moveIndex += 1;
    }

    if (this.mode.moveIndex === this.mode.moves.length) {
      this.mode = {
        type: 'IDLE',
      };
      return [{}];
    }

    return this.performMove();
  }

  /**
   * Try to attack if in range, or move into range otherwise
   */
  getAttackMessages() {
    const targetPosition = { x: this.mode.target.getX(), y: this.mode.target.getY() };

    if (this.getDistanceToTarget(targetPosition) < 2) {
      const damageDealt = this.attack(this.mode.target);
      const result = [{ type: 'DealDamage', shipId: this.getId(), enemyShipId: this.mode.target.getId(), damage: damageDealt }];
  

      if (this.mode.target.getHealth() <= 0) {
        this.map.removeShip(this.mode.target);
        this.mode = {
          type: 'IDLE',
        };
      }
      
      return result;
    }

    this.mode.moves = this.performAStar(targetPosition);
    if (this.mode.moves == null) {
      // No such path
      return [{}];
    }

    this.mode.moveIndex = 0;

    if (this.closeEnoughToWayPoint()) {
      this.mode.moveIndex += 1;
    }

    if (this.mode.moveIndex === this.mode.moves.length) {
      return [{}];
    }

    return this.performMove();
  }

  /**
   * Update the ship and get the corresponding update messages.
   */
  getUpdateMessages() {
    const result = [];

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
    return this.stats.getHealth();
  }

  attack(enemyShip) {
    return enemyShip.dealDamage(this.stats.getDamage());
  }

  dealDamage(damage) {
    return this.stats.dealDamage(damage);
  }

}

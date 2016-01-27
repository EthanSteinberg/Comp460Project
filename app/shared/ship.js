const shipMoveSpeed = 0.05;

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

    this.mode = {
      type: 'IDLE',
    };
  }

  render(context, images) {
    context.drawImage(images.ship, (this.x - 0.5) * 50, (this.y - 0.5) * 50, 50, 50);

    if (this.isSelected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(
        (this.x - 0.5) * 50,
        (this.y - 0.5) * 50,
        50,
        50
      );
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
    this.x = x;
    this.y = y;
  }

  setMoves(moves) {
    this.mode = {
      type: 'MOVING',
      moves: moves,
      ticksTillNextMove: 0,
      moveIndex: 1,
    };
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
    return this.getDistanceToTarget() <= 0.01;
  }

  getDistanceToTarget() {
    const { x, y } = this.mode.moves[this.mode.moveIndex];

    const distance = Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
    return distance;
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

    const currentMove = this.mode.moves[this.mode.moveIndex];

    const scale = Math.min(shipMoveSpeed, this.getDistanceToTarget());

    const move = {
      x: this.x + (currentMove.x - this.x) / this.getDistanceToTarget() * scale,
      y: this.y + (currentMove.y - this.y) / this.getDistanceToTarget() * scale,
    };

    return this.tryMove(move);
  }

  /**
   * Try to attack if in range, or move into range otherwise
   */
  getAttackMessages() {
    this.ticksTillNextMove += 1;
    if (this.ticksTillNextMove === 20) {
      this.ticksTillNextMove = 0;

      this.moveIndex += 1;

      if (this.moveIndex === this.moves.length - 1) {
        this.moving = false;
        const lastMove = this.moves[this.moves.length - 1];

        return this.tryMove(lastMove);
      }
    }

    const currentMove = this.moves[this.moveIndex];
    const nextMove = this.moves[this.moveIndex + 1];

    const nextMoveFactor = this.ticksTillNextMove / 20.0;
    const currentMoveFactor = 1 - nextMoveFactor;

    const interpolatedPosition = {
      x: currentMove.x * currentMoveFactor + nextMove.x * nextMoveFactor,
      y: currentMove.y * currentMoveFactor + nextMove.y * nextMoveFactor,
    };

    return this.tryMove(interpolatedPosition);
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

}

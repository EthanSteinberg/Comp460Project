
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
    this.set = true;
    this.type = 'ship';
    this.isSelected = false;
    this.stats = stats;
    this.enemyTarget = null;
    this.attackTime = 0;

    this.smoke1Y = 0;
    this.smoke2Y = 0;
  }

  render(context, images) {
    context.drawImage(images.ship, (this.x - 0.5) * 50, (this.y - 0.5) * 50, 50, 50);

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
    this.moving = true;
    this.moves = moves;
    this.moves[0] = { x: this.getX(), y: this.getY() };
    this.ticksTillNextMove = 0;
    this.moveIndex = 0;
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
      this.moving = false;
      return [];
    }
    this.setPosition(move.x, move.y);
    return [{ type: 'SetShipPosition', shipId: this.id, position: move }];
  }

  /**
   * Move the ship and perform the corresponding updates.
   */
  getMoveMessages() {
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
   * Move the ship and perform the corresponding updates.
   */
  getSetMessage() {
    this.set = false;
    const pos = { x: this.x, y: this.y };
    return [{ type: 'SetPosition', object: this.type, position: pos, islandID: 0, stats: this.stats }];
  }

  /**
   * Update the ship and get the corresponding update messages.
   */
  getUpdateMessages() {
    const result = [];
    if (this.moving) {
      result.push(...this.getMoveMessages());
    }

    if (this.set) {
      result.push(...this.getSetMessage());
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
    this.enemyTarget = enemyShip;
    if (enemyShip != null) {
      return enemyShip.dealDamage(this.stats.getDamage());
    } else {
      return 0;
    }
  }

  dealDamage(damage) {
    return this.stats.dealDamage(damage);
  }

  targetShip(enemyShip) {
    this.enemyTarget = enemyShip;
    this.attackTime = 100;
  }

  getTarget() {
    return this.enemyTarget;
  }

  clockAttackTime() {
    this.attackTime -= 1;
    if (this.attackTime < 0) {
      this.attackTime = 100;
    }
    return this.attackTime;
  }

}

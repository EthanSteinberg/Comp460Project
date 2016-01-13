/**
 * A ship entity.
 */
let nextId = 0;

export default class Ship {

  constructor(map, x, y) {
    this.map = map;
    this.x = x;
    this.y = y;
    this.id = nextId++;
  }

  render(context, images) {
    context.drawImage(images.ship, (this.x - 0.5) * 50, (this.y - 0.5) * 50, 50, 50);
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
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
   * Update the ship and get the corresponding update messages.
   */
  getUpdateMessages() {
    const result = [];
    if (this.moving) {
      result.push(...this.getMoveMessages());
    }

    return result;
  }

  getId() {
    return this.id;
  }

}

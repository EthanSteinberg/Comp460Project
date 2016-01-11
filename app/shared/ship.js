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
    context.drawImage(images.ship, this.x * 50, this.y * 50, 50, 50);
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  setPosition(x, y) {
    const oldPosition = { x: this.x, y: this.y };
    const newPosition = { x, y };
    this.map.updatePosition(this, oldPosition, newPosition);

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

        this.setPosition(lastMove.x, lastMove.y);

        return [{ type: 'SetShipPosition', shipId: this.id, position: lastMove }];
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

    this.setPosition(interpolatedPosition.x, interpolatedPosition.y);
    return [{ type: 'SetShipPosition', shipId: this.id, position: interpolatedPosition }];
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

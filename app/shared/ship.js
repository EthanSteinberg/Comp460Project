/**
 * A ship entity.
 */
 
export default class Ship {

  constructor(map, x, y) {
    this.map = map;
    this.x = x;
    this.y = y;
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
    this.ticksTillNextMove = 1;
    this.moveIndex = 0;
  }

  tick() {
    if (this.moving) {
      this.ticksTillNextMove -= 1;
      if (this.ticksTillNextMove === 0) {
        this.ticksTillNextMove = 20;
        const move = this.moves[this.moveIndex];
        this.setPosition(move.x, move.y);
        this.moveIndex += 1;

        if (this.moveIndex === this.moves.length) {
          this.moving = false;
        }
      }
    }
  }
}

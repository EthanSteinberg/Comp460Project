/**
 * A mine entity.
 */
 
export default class Mine {

  constructor(map, x, y) {
    this.map = map;
    this.x = x;
    this.y = y;
  }

  render(context, images) {
    context.drawImage(images.mine, this.x * 50, this.y * 50, 50, 50);
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }
}

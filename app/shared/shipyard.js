/**
 * A shipyard entity.
 */
 
export default class Shipyard {

  constructor(map, x, y) {
    this.map = map;
    this.x = x;
    this.y = y;
  }

  render(context, images) {
    context.drawImage(images.shipyard, this.x * 50, this.y * 50, 50, 50);
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }
}

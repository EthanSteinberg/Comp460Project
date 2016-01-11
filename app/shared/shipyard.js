/**
 * A shipyard entity.
 */
let nextId = 0;

 
export default class Shipyard {

  constructor(map, x, y) {
    this.map = map;
    this.x = x;
    this.y = y;
    this.id = nextId++;
    this.moving = true;
    this.type = 'shipyard';
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

  getId() {
    return this.id;
  }

  /**
   * Move the ship and perform the corresponding updates.
   */
  getMoveMessages() {
    this.moving = false;
    const pos = { x: this.x, y: this.y };
    return [{ type: 'SetBuildingPosition', building: this.type, position: pos }];
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
}

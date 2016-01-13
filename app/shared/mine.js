/**
 * A mine entity.
 */
let nextId = 0;
 
export default class Mine {

  constructor(map, x, y, islandID) {
    this.map = map;
    this.x = x;
    this.y = y;
    this.id = nextId++;
    this.set = true;
    this.type = 'mine';
    this.islandID = islandID;
  }

  render(context, images) {
    context.drawImage(images.mine, (this.x - 0.5) * 50, (this.y - 0.5) * 50, 50, 50);
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
  getSetMessage() {
    this.set = false;
    const pos = { x: this.x, y: this.y };
    return [{ type: 'SetPosition', object: this.type, position: pos }];
  }

  /**
   * Update the ship and get the corresponding update messages.
   */
  getUpdateMessages() {
    const result = [];
    if (this.set) {
      result.push(...this.getSetMessage());
    }

    return result;
  }
}

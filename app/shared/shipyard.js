/**
 * A shipyard entity.
 */
let nextId = 0;

 
export default class Shipyard {

  constructor(map, x, y, islandID) {
    this.map = map;
    this.x = x;
    this.y = y;
    this.id = nextId++;
    this.set = true;
    this.type = 'shipyard';
    this.islandID = islandID;
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

  getIslandID() {
    return this.islandID;
  }

  /**
   * Move the ship and perform the corresponding updates.
   */
  getSetMessage() {
    this.set = false;
    const pos = { x: this.x, y: this.y };
    return [{ type: 'SetPosition', object: this.type, position: pos, islandID: this.islandID }];
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

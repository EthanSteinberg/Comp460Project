/**
 * A mine entity.
 */

export default class Mine {

  constructor(map, x, y, islandID) {
    this.map = map;
    this.x = x;
    this.y = y;
    this.id = map.getNextEntityId();
    this.set = true;
    this.type = 'mine';
    this.islandID = islandID;
  }

  render(context, images) {
    context.drawImage(images.mine, (this.x - 0.5) * 50, (this.y - 0.5) * 50, 50, 50);

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

  getId() {
    return this.id;
  }

  getType() {
    return this.type;
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
    this.map.setCoins(this.map.getCoins() + 0.2);

    return [{ type: 'SetResources', coin: this.map.getCoins() }];
  }
}

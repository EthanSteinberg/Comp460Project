import buildingConstants from './buildingconstants';

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
    this.timeLeftToBuild = buildingConstants[this.type].buildTime;
  }

  render(context, images) {

    //TODO: Building indication
    // const color = Math.floor(this.timeLeftToBuild/buildingConstants[this.type].buildTime * 256);
    // console.log(color);
    // context.fillStyle = `rgb(${color},${color}, ${color})`;
    // context.fillRect((this.x - 0.5) * 50, (this.y - 0.5) * 50, 50, 50);

    context.drawImage(images.shipyard, (this.x - 0.5) * 50, (this.y - 0.5) * 50, 50, 50);

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

  getIslandID() {
    return this.islandID;
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
    return [{ type: 'SetPosition', object: this.type, position: pos, islandID: this.islandID, stats: null }];
  }

  /**
   * Update the ship and get the corresponding update messages.
   */
  getUpdateMessages() {
    if (this.timeLeftToBuild > 0) {
      this.timeLeftToBuild -= 1;
      return [{ type: 'UpdateTimeLeftToBuild', id: this.id, timeLeftToBuild: this.timeLeftToBuild, object: this.type }];
    }

    // Done building
    return [{}];
  }
}

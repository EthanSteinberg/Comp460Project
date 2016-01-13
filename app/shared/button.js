import {MAP_WIDTH} from './gamemap';
import {MAP_HEIGHT} from './gamemap';
import Mine from './mine';
import Shipyard from './shipyard';


/**
 * A button entity.
 */

export default class Button {

  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
  }

  render(context, images) {
    switch (this.type) {
      case 'mine':
        context.drawImage(images.mine, (this.x - 0.5) * 50, (this.y - 0.5) * 50, 50, 50);
        break;
      case 'shipyard':
        context.drawImage(images.shipyard, (this.x - 0.5) * 50, (this.y - 0.5) * 50, 50, 50);
        break;
      default:
        console.error('Trying to render unknown button');
    }
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getBuilding() {
    switch (this.type) {
      case 'mine':
        return 'mine';
      case 'shipyard':
        return 'shipyard';
      default:
        console.error('unknown building type');
        return null;
    }
  }
}

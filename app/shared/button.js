import {MAP_WIDTH} from './gamemap';
import {MAP_HEIGHT} from './gamemap';
import Mine from './mine';
import Shipyard from './shipyard';


/**
 * A button entity.
 */
 
export default class Button {

  constructor(type, x, y) {
    this.type = type
    this.x = x;
    this.y = y;
  }

  render(context, images) {
    switch(this.type) {
      case 'mine': 
        context.drawImage(images.mine, this.x * 50, this.y * 50, 50, 50);
        break;
      case 'shipyard': 
        context.drawImage(images.shipyard, this.x * 50, this.y * 50, 50, 50);
        break;
    }
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getBuilding(map, x, y) {
    switch(this.type) {
      case 'mine': 
        return new Mine(map, x, y);
      case 'shipyard': 
        return new Shipyard(map, x, y);
    }
  }
}

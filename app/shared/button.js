import {MAP_WIDTH} from './gamemap';
import {MAP_HEIGHT} from './gamemap';
import Mine from './mine';
import Shipyard from './shipyard';


/**
 * A button entity.
 */

export default class Button {

  constructor(type, x, y, templateNum) {
    this.type = type;
    this.x = x;
    this.y = y;

    this.templateNum = templateNum;
  }

  render(context, images, isSelected) {
    switch (this.type) {
      case 'mine':
        context.drawImage(images.mine, this.x * 50, this.y * 50, 50, 50);
        break;
      case 'shipyard':
        context.drawImage(images.shipyard, this.x * 50, this.y * 50, 50, 50);
        break;
      case 'shiptemplate':
        context.drawImage(images.ship, this.x * 50, this.y * 50, 50, 50);
        break;
      case 'shipbuilder':
        context.fillStyle = 'red';
        context.fillRect(this.x * 50, this.y * 50, 50, 50);
        context.font = '10px Arial';
        context.fillStyle = 'black';
        context.fillText('SHIP', this.x * 50 + 15, this.y * 50 + 10);
        context.fillText('BUILDER', this.x * 50 + 5, this.y * 50 + 20);
        break;
      case 'tactical':
        context.fillStyle = 'red';
        context.fillRect(this.x * 50, this.y * 50, 50, 50);
        context.font = '10px Arial';
        context.fillStyle = 'black';
        context.fillText('ZOOM', this.x * 50 + 10, this.y * 50 + 10);
        context.fillText('OUT', this.x * 50 + 15, this.y * 50 + 20);
        break;
      case 'strategic':
        context.fillStyle = 'red';
        context.fillRect(this.x * 50, this.y * 50, 50, 50);
        context.font = '10px Arial';
        context.fillStyle = 'black';
        context.fillText('ZOOM', this.x * 50 + 10, this.y * 50 + 10);
        context.fillText('IN', this.x * 50 + 20, this.y * 50 + 20);
        break;

      case 'roundshot':
        context.drawImage(images.roundshot, this.x * 50, this.y * 50, 50, 50);
        break;
      case 'grapeshot':
        context.drawImage(images.grapeshot, this.x * 50, this.y * 50, 50, 50);
        break;
      case 'chainshot':
        context.drawImage(images.roundshot, this.x * 50, this.y * 50, 50, 50);
        break;
      case 'shell':
        context.drawImage(images.roundshot, this.x * 50, this.y * 50, 50, 50);
        break;

      case 'hull':
        context.fillStyle = 'red';
        context.fillRect(this.x * 50, this.y * 50, 50, 50);
        context.font = '10px Arial';
        context.fillStyle = 'black';
        context.fillText('TARGET', this.x * 50 + 5, this.y * 50 + 10);
        context.fillText('HULL', this.x * 50 + 10, this.y * 50 + 20);
        context.fillStyle = 'DimGrey';
        context.fillRect((this.x + 1) * 50, this.y * 50, 50, 50);
        context.font = '10px Arial';
        context.fillStyle = 'black';
        context.fillText('TARGET', (this.x + 1) * 50 + 5, this.y * 50 + 10);
        context.fillText('CANNONS', (this.x + 1) * 50, this.y * 50 + 20);
        context.strokeStyle = 'black';
        context.strokeRect(this.x * 50, this.y * 50, 100, 50);
        break;
      case 'hardpoints':
        context.fillStyle = 'DimGrey';
        context.fillRect(this.x * 50, this.y * 50, 50, 50);
        context.font = '10px Arial';
        context.fillStyle = 'black';
        context.fillText('TARGET', this.x * 50 + 5, this.y * 50 + 10);
        context.fillText('HULL', this.x * 50 + 10, this.y * 50 + 20);
        context.fillStyle = 'red';
        context.fillRect((this.x + 1) * 50, this.y * 50, 50, 50);
        context.font = '10px Arial';
        context.fillStyle = 'black';
        context.fillText('TARGET', (this.x + 1) * 50 + 5, this.y * 50 + 10);
        context.fillText('CANNONS', (this.x + 1) * 50, this.y * 50 + 20);
        context.strokeStyle = 'black';
        context.strokeRect(this.x * 50, this.y * 50, 100, 50);
        break;


      default:
        console.error('Trying to render unknown button: ',  this.type);
    }

    if (isSelected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(
        this.x * 50,
        this.y * 50,
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

  getTemplateNum() {
    return this.templateNum;
  }

  isBuilding() {
    switch (this.type) {
      case 'mine':
      case 'shipyard':
        return true;
      default:
        return false;
    }
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

  getType() {
    return this.type;
  }

  setType(type) {
    this.type = type;
  }
}

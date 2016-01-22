
import {MAP_WIDTH} from './gamemap';
import {MAP_HEIGHT} from './gamemap';

let nextId = 0;

/**
 * A button entity.
 */

export default class GuiButton {

  constructor(type, x, y, templateNum) {
    this.type = type;
    this.rendertype = type;
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.selected = false;
    this.id = nextId++;

    if (this.type == 'template') {
      this.templateNum = templateNum;
    }
  }

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, 50, 50);
    }

    context.font = '20px sans-serif';
    context.fillStyle = 'black';

    switch (this.rendertype) {
      case 'roundshot':
        context.drawImage(images.roundshot, this.x, this.y, 50, 50);
        break;
      case 'chainshot':
        context.drawImage(images.chainshot, this.x, this.y, 50, 50);
        break;
      case 'grapeshot':
        context.drawImage(images.grapeshot, this.x, this.y, 50, 50);
        break;
      case 'shell':
        context.drawImage(images.shell, this.x, this.y, 50, 50);
        break;
      case 'gunboat':
        context.drawImage(images.gunboat, this.x, this.y, 50, 50);
        context.fillText('GUNBOAT', this.x, this.y + 60);
        break;
      case 'frigate':
        context.drawImage(images.frigate, this.x, this.y, 50, 50);
        context.fillText('FRIGATE', this.x, this.y + 60);     
        break;
      case 'galleon':
        context.drawImage(images.galleon, this.x, this.y, 50, 50);
        context.fillText('GALLEON', this.x, this.y + 60);    
        break;
      case 'gunslot':
        context.fillStyle = 'coral';
        context.fillRect(this.x, this.y, 50, 50);
        break;
      case 'hullslot':
        context.fillStyle = 'cornflowerblue';
        context.fillRect(this.x, this.y, 50, 50);
        break;
      case 'save':
        context.fillStyle = 'red';
        context.fillRect(this.x, this.y, 50, 50);
        context.fillStyle = 'black';
        context.fillText('SAVE', this.x + 5, this.y + 15);
        break;
      case 'template':
        context.fillStyle = 'cornsilk';
        context.fillRect(this.x, this.y, 50, 50);
        break;
      case 'templateSelected':
        context.fillStyle = 'cornsilk';
        context.fillRect(this.x, this.y, 50, 50);
        context.drawImage(images.template, this.x, this.y, 50, 50);
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

  getId() {
    return this.id;
  }

  getType() {
    return this.type;
  }

  getTemplateNum() {
    return this.templateNum;
  }

  getRenderType() {
    return this.rendertype;
  }

  restorePos() {
    this.x = this.originalX;
    this.y = this.originalY;
  }

  placeItem(type) {
    if(this.type != 'gunslot' && this.type != 'hullslot' && this.type != 'template') {
      console.error('Not a slot. Improper placement.');
    }
    this.rendertype = type;
  }

  emptyslot(mouseX, mouseY) {
    if (mouseX > this.x && mouseX < this.x + 50) {
      if (mouseY > this.y && mouseY < this.y + 50) {
        var oldtype = this.rendertype;
        this.rendertype = this.type;
        return oldtype;
      }
    }
    return null;
  }

  select(mouseX, mouseY) {
    if (mouseX > this.x && mouseX < this.x + 50) {
      if (mouseY > this.y && mouseY < this.y + 50) {
        this.selected = true;
        return this.id;
      }
    }

    this.selected = false;
    return -1;
  }

  deselect() {
    this.selected = false;
  }


}

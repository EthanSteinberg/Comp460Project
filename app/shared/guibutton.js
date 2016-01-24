
import {MAP_WIDTH} from './gamemap';
import {MAP_HEIGHT} from './gamemap';

let nextId = 0;

/**
 * A button entity.
 */

export default class GuiButton {

  constructor(type, x, y, slotNum) {
    this.type = type;
    this.rendertype = type;
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.selected = false;
    this.id = nextId++;

    this.slotNum = slotNum;
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

  getSlotNum() {
    return this.slotNum;
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

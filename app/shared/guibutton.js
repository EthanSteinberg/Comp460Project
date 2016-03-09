let nextId = 0;

/**
 * A button entity.
 */

export default class GuiButton {

  constructor(type, x, y, width, height, slotNum, selection, template) {
    this.type = type;
    this.rendertype = type;
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.selected = false;
    this.id = nextId++;
    this.visible = true;

    this.slotNum = slotNum;
    this.templateNum = slotNum;

    this.selection = selection;

    this.template = template;
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

  getTemplateNum() {
    return this.templateNum;
  }

  getRenderType() {
    return this.rendertype;
  }

  setVisible(visible) {
    this.visible = visible;
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

  isOver(mouseX, mouseY) {
    if (mouseX > this.x && mouseX < this.x + this.width) {
      if (mouseY > this.y && mouseY < this.y + this.height) {
        return true;
      }
    }
    return false;
  }

  select(mouseX, mouseY) {
    if (this.isOver(mouseX, mouseY)) {
      this.selected = true;
      return this.id;
    }

    this.selected = false;
    return -1;
  }

  deselect() {
    this.selected = false;
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

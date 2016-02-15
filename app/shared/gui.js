import buildingConstants from './buildingconstants';

import Shipyard from './guibuttons/shipyard';
import Shiptemplate from './guibuttons/shiptemplate';
import Shipbuilder from './guibuttons/shipbuilder';
import Roundshot from './guibuttons/roundshot';
import Grapeshot from './guibuttons/grapeshot';
import Chainshot from './guibuttons/chainshot';
import Shell from './guibuttons/shell';
import Cancelshot from './guibuttons/cancelshot';
import TargetToggle from './guibuttons/targettoggle';
import Exit from './guibuttons/exit';
import Template from './guibuttons/template';
import Gunboat from './guibuttons/gunboat';
import Frigate from './guibuttons/frigate';
import Galleon from './guibuttons/galleon';
import ShipSkeleton from './guibuttons/shipskeleton';
import Gunslot from './guibuttons/gunslot';
import Save from './guibuttons/save';

/**
 * A map of the game containing islands and all current ships.
 */
export default class Gui {

  constructor(canvasWidth, canvasHeight, templates, selectionState, map) {
    this.width = 200;
    this.height = canvasHeight;

    this.x = canvasWidth - this.width;
    this.y = 0;

    this.buttons = [];
    this.designerButtons = [];

    this.templates = templates;

    this.selectionState = selectionState;

    this.map = map;

    this.displayMode = 'main';

    this.changing = false;
    this.selectedSlot = null;
    this.chosenIndex = 0;
    this.workingTemplate = JSON.parse(JSON.stringify(this.templates[this.chosenIndex]));
  }

  setSelectionState(newSelectionState) {
    this.selectionState = newSelectionState;
  }

  getSelectedMapItems() {
    return this.selectionState.map.map(id => this.map.getEntity(id));
  }

  /**
   * Render the gui
   */
  render(context, images, map, hoverCoords) {
    if (this.displayMode === 'main') {
      this.renderMain(context, images, map, hoverCoords);
    } else if (this.displayMode === 'designer') {
      this.renderDesigner(context, images, map, hoverCoords);
    }
  }

  renderDesigner(context, images, map, hoverCoords) {
    context.fillStyle = 'gray';
    context.fillRect(this.x, this.y, this.width, this.height);

    const skeleton = new ShipSkeleton('shipskeleton', this.x + 50, this.y + 170, 100, 270);
    skeleton.render(context, images);

    for (const button of this.getDesignerButtons()) {
      const isSelected = this.selectionState.gui != null && this.selectionState.gui.type === button.type &&
        this.selectionState.gui.slotNum === button.slotNum;
      button.selected = isSelected;
      button.render(context, images);
    }

    // Hovering logic
    if (hoverCoords != null) {
      const roundedX = hoverCoords.x;
      const roundedY = hoverCoords.y;

      const item = this.getItem(roundedX, roundedY);
    }
  }

  renderMain(context, images, map, hoverCoords) {
    context.fillStyle = 'gray';
    context.fillRect(this.x, this.y, this.width, this.height);

    const moneyText = Math.floor(map.getEntity(this.map.team).coins).toString();

    context.fillStyle = 'black';
    context.textBaseline = 'top';
    context.font = '24px sans-serif';
    context.fillText(moneyText, this.x + 30, this.y + 5);

    const width = context.measureText(moneyText).width;

    context.strokeStyle = 'black';
    context.strokeRect(this.x, this.y, width + 40, 35);
    context.drawImage(images.money, (this.x), (this.y) + 5, 25, 25);

    context.fillText('Team: ', (this.x) + 100, (this.y) + 5);
    if (this.map.team === '1') {
      context.fillStyle = 'firebrick';
    } else {
      context.fillStyle = 'royalblue';
    }
    context.fillRect(this.x + 175, this.y + 5, 25, 25);

    for (const button of this.getButtons()) {
      const isSelected = this.selectionState.gui != null && this.selectionState.gui.type === button.type &&
        this.selectionState.gui.slotNum === button.slotNum;
      button.selected = isSelected;
      button.render(context, images);
    }

    if (hoverCoords != null) {
      const roundedX = hoverCoords.x;
      const roundedY = hoverCoords.y;

      const item = this.getItem(roundedX, roundedY);

      if (item != null && item.isBuilding()) {
        const buildingType = item.getBuilding();

        const details = buildingConstants[buildingType];

        // Display a tooltip
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.strokeRect((roundedX - 2), (roundedY + 1), 200, 50);
        context.fillRect((roundedX - 2), (roundedY + 1), 200, 50);

        context.fillStyle = 'black';
        context.textBaseline = 'top';
        context.font = '14px sans-serif';
        context.fillText(details.name, (roundedX - 2), (roundedY + 1));
        context.fillText(details.description, (roundedX - 2), (roundedY + 1) + 20);
        context.fillText('Cost: ' + details.coinCost + ' coin, ' + details.buildTime + ' seconds', (roundedX - 2), (roundedY + 1) + 34);
      } else if (item != null && item.getType() === "shiptemplate") {
        const template = this.templates[item.slotNum];
        context.strokeStyle = 'cyan';
        context.strokeRect(item.x, item.y, item.width, item.height);
      }
    }
  }

  getUnitButtons() {
    const result = [];
    if (this.getSelectedMapItems().length !== 0 && this.getSelectedMapItems().every(entity => entity.type === 'shipyard')) {
      result.push(new Shiptemplate('shiptemplate', this.x + 25, 250, 50, 50, 0, this.getSelectedMapItems()[0]));
      result.push(new Shiptemplate('shiptemplate', this.x + 75, 250, 50, 50, 1, this.getSelectedMapItems()[0]));
      result.push(new Shiptemplate('shiptemplate', this.x + 125, 250, 50, 50, 2, this.getSelectedMapItems()[0]));
    } else {
      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 25, 250, 50, 50, 0));
      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 75, 250, 50, 50, 1));
      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 125, 250, 50, 50, 2));
    }

    result.push(new Shipyard('shipyard', this.x + 25, this.y + 175, 50, 50));
    result.push(new Shipbuilder('shipbuilder', this.x + 50, this.height - 75, 102, 26));
    result.push(new TargetToggle(this.map.getEntity(this.map.team).targetMode, this.x+35, 350, 128, 26));
    return result;
  }

  getDesignerButtons() {
    const result = [];

    result.push(new Exit('exit', this.x + this.width - 20, this.y, 20, 20));

    result.push(new Template('template', this.x + 20, this.y + 25, 50, 50, 0));
    result.push(new Template('template', this.x + 75, this.y + 25, 50, 50, 1));
    result.push(new Template('template', this.x + 130, this.y + 25, 50, 50, 2));

    result.push(new Gunboat('gunboat', this.x + 20, this.y + 90, 50, 50));
    result.push(new Frigate('frigate', this.x + 75, this.y + 90, 50, 50));
    result.push(new Galleon('galleon', this.x + 130, this.y + 90, 50, 50));

    result.push(new Gunslot('gunslot', this.x + 75, this.y + 260, 40, 40, 0));
    result.push(new Gunslot('gunslot', this.x + 75, this.y + 350, 40, 40, 1));

    if (this.selectedSlot != null) {
      result.push(new Roundshot('roundshot', this.selectedSlot.x - 60, this.selectedSlot.y + 5, 40, 40));
      result.push(new Chainshot('chainshot', this.selectedSlot.x - 30, this.selectedSlot.y - 45, 40, 40));
      result.push(new Grapeshot('grapeshot', this.selectedSlot.x + 30, this.selectedSlot.y - 45, 40, 40));
      result.push(new Shell('shell', this.selectedSlot.x + 60, this.selectedSlot.y + 5, 40, 40));
      result.push(new Cancelshot('cancelshot', this.selectedSlot.x + 5, this.selectedSlot.y + 50, 40, 40));
    }

    result.push(new Save('save', this.x, this.y + this.height - 50, 60, 50));


    for (const button of result) {
      button.setVisible(this.chosenIndex != null);

      if (button.getType() === 'template') {
        if (button.getSlotNum() === this.chosenIndex) {
          button.placeItem('templateSelected');
        } else {
          button.placeItem('template');
        }
      } else if (button.getType() === 'gunboat' && this.workingTemplate.hull === 'gunboat') {
        button.setType('gunboatSelected');
      } else if (button.getType() === 'frigate' && this.workingTemplate.hull === 'frigate') {
        button.setType('frigateSelected');
      } else if (button.getType() === 'galleon' && this.workingTemplate.hull === 'galleon') {
        button.setType('galleonSelected');
      } else if (button.getType() === 'gunslot') {
        const ship = this.templates[this.chosenIndex];
        if (this.changing) {
          button.placeItem(this.workingTemplate.hardpoints[button.getSlotNum()] || 'gunslot');
        } else {
          button.placeItem(this.workingTemplate.hardpoints[button.getSlotNum()] 
            || ship.hardpoints[button.getSlotNum()] || 'gunslot');
        }
      }
    }

    return result;
  }

  designerSelection(item) {
    const withItem = JSON.parse(JSON.stringify(this.workingTemplate));

    switch (item.getType()) {
      case 'exit':
        this.displayMode = 'main';
        this.workingTemplate = JSON.parse(JSON.stringify(this.templates[this.chosenIndex]));
        this.changing = false;
        break;
      case 'template':
        this.chosenIndex = item.getSlotNum();
        this.workingTemplate = JSON.parse(JSON.stringify(this.templates[this.chosenIndex]));
        this.changing = false;
        break;
      case 'gunboat':
      case 'frigate':
      case 'galleon':
        this.workingTemplate.hull = item.getType();
        break;
      case 'gunslot':
        this.selectedSlot = item;
        break;
      case 'roundshot':
      case 'chainshot':
      case 'grapeshot':
      case 'shell':
        withItem.hardpoints[this.selectedSlot.getSlotNum()] = item.getType();
        this.workingTemplate = withItem;
        this.selectedSlot = null;
        break;
      case 'cancelshot':
        withItem.hardpoints[this.selectedSlot.getSlotNum()] = null;
        this.workingTemplate = withItem;
        this.selectedSlot = null;
        this.changing = true;
        break;
      case 'save':
        this.templates[this.chosenIndex] = this.workingTemplate;
        this.displayMode = 'main';
        this.workingTemplate = JSON.parse(JSON.stringify(this.templates[this.chosenIndex]));
        this.changing = false;
      default:
        this.selectedSlot = null;
    }
  }

  getButtons() {
    return this.buttons.concat(this.getUnitButtons() || []);
  }

  getItem(x, y) {
    if (this.displayMode === 'main') {
      for (const button of this.getButtons()) {
        if (button.isOver(x, y)) {
          return button;
        }
      }
    } else if (this.displayMode === 'designer') {
      for (const button of this.getDesignerButtons()) {
        if (button.isOver(x, y)) {
          return button;
        }
      }
    }

    return null;
  }
}

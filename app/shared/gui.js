import buildingConstants from './buildingconstants';
import { roundshot, grapeshot, chainshot, shell,
  gunboat, frigate, galleon, getStats } from './template';

import Shipyard from './guibuttons/shipyard';
import Mine from './guibuttons/mine';
import Shiptemplate from './guibuttons/shiptemplate';
import Shipbuilder from './guibuttons/shipbuilder';
import Roundshot from './guibuttons/roundshot';
import Grapeshot from './guibuttons/grapeshot';
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
import Hullslot from './guibuttons/hullslot';
import Save from './guibuttons/save';

export const GUI_WIDTH = 200;

/**
 * A map of the game containing islands and all current ships.
 */
export default class Gui {

  constructor(canvasWidth, canvasHeight, templates, selectionState, map, team) {
    this.width = GUI_WIDTH;
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

    this.team = team;
  }

  setSelectionState(newSelectionState) {
    this.selectionState = newSelectionState;
  }

  getSelectedMapItems() {
    return this.selectionState.map.map(id => this.map.getEntity(id)).filter(item => item != null);
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

    // titles
    context.fillStyle = 'black';
    context.textBaseline = 'top';
    context.font = '14px Perpetua';
    context.fillText("SAVE SLOTS", this.x + 20, this.y + 10);

    const skeleton = new ShipSkeleton('shipskeleton', this.x + 50, this.y + 110, 100, 340);
    skeleton.render(context, images);

    for (const button of this.getDesignerButtons()) {
      const isSelected = this.selectionState.gui != null && this.selectionState.gui.type === button.type &&
        this.selectionState.gui.slotNum === button.slotNum;
      button.selected = isSelected;
      button.render(context, images);
    }

    // Display stats at the bottom of the gui
    context.fillStyle = 'black';
    context.textBaseline = 'top';
    context.font = '14px Perpetua';
    context.fillText(this.workingTemplate.hull.toUpperCase(), this.x + 10, this.height - 50);
    context.fillText(this.workingTemplate.hardpoints, this.x + 20, this.height - 35);
    context.fillText('Cost: ' + getStats(this.workingTemplate).cost + ' coin, '
      + getStats(this.workingTemplate).tcost + ' sec',
      this.x + 20, this.height - 20);


    // Hovering logic
    if (hoverCoords != null) {
      const roundedX = hoverCoords.x;
      const roundedY = hoverCoords.y;

      const item = this.getItem(roundedX, roundedY);

      if (item != null) {
        let details = null;
        let type = item.getType();

        if (type == 'gunslot' && item.rendertype != 'gunslot') {
          type = item.rendertype;
        }

        switch (type) {
          case 'gunboat':
          case 'gunboatSelected':
            details = gunboat;
            break;
          case 'frigate':
          case 'frigateSelected':
            details = frigate;
            break;
          case 'galleon':
          case 'galleonSelected':
            details = galleon;
            break;
          case 'roundshot':
            details = roundshot;
            break;
          case 'chainshot':
            details = chainshot;
            break;
          case 'grapeshot':
            details = grapeshot;
            break;
          case 'shell':
            details = shell;
            break;
          default:
            details = null;
        }


        if (details != null) {
          // Display a tooltip
          context.fillStyle = 'white';
          context.strokeStyle = 'black';
          let modifier = 0;
          if ((roundedX - 2) > this.x + this.width / 2 - 100) {
            modifier = this.width / 2 * -1;
          }

          context.strokeRect((roundedX - 2) + modifier, (roundedY + 1), 200, 50);
          context.fillRect((roundedX - 2) + modifier, (roundedY + 1), 200, 50);

          context.fillStyle = 'black';
          context.textBaseline = 'top';
          context.font = '14px Perpetua';

          context.fillText(details.name, (roundedX - 2) + modifier, (roundedY + 1));
          context.fillText(details.description, (roundedX - 2) + modifier, (roundedY + 1) + 20);
          context.fillText('Cost: ' + details.cost + ' coin, ' + details.tcost + ' seconds', (roundedX - 2) + modifier, (roundedY + 1) + 34);
        }
      }
    }
  }

  renderMain(context, images, map, hoverCoords) {
    context.fillStyle = 'gray';
    context.fillRect(this.x, this.y, this.width, this.height);

    const moneyText = Math.floor(map.getEntity(this.team).coins).toString();

    context.fillStyle = 'black';
    context.textBaseline = 'top';
    context.font = '24px Perpetua';
    context.fillText(moneyText, this.x + 32, this.y + 5);

    const width = context.measureText(moneyText).width;

    context.strokeStyle = 'black';
    context.strokeRect(this.x + 2, this.y, width + 40, 35);
    context.drawImage(images.money, (this.x) + 2, (this.y) + 5, 25, 25);

    if (this.team === '1') {
      context.fillStyle = 'firebrick';
      context.fillText('Pirates', (this.x) + 110, (this.y) + 5);

    } else {
      context.fillStyle = 'darkblue';
      context.fillText('Imperials', (this.x) + 100, (this.y) + 5);
    }

    for (const button of this.getButtons()) {
      const isSelected = this.selectionState.gui != null && this.selectionState.gui.type === button.type &&
        this.selectionState.gui.slotNum === button.slotNum;
      button.selected = isSelected;
      button.render(context, images);
    }

    if (hoverCoords != null) {
      const roundedX = hoverCoords.x;
      const roundedY = hoverCoords.y;

      let modifier = 0;
      if ((roundedX - 2) > this.x + this.width / 2 - 100) {
        modifier = this.width / 2 * -1;
      }

      const item = this.getItem(roundedX, roundedY);

      if (item != null && item.isBuilding()) {
        const buildingType = item.getBuilding();

        const details = buildingConstants[buildingType];

        // Display a tooltip
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.strokeRect((roundedX - 2) + modifier, (roundedY + 1), 200, 50);
        context.fillRect((roundedX - 2) + modifier, (roundedY + 1), 200, 50);

        context.fillStyle = 'black';
        context.textBaseline = 'top';
        context.font = '14px Perpetua';
        context.fillText(details.name, (roundedX - 2) + modifier, (roundedY + 1));
        context.fillText(details.description, (roundedX - 2) + modifier, (roundedY + 1) + 20);
        context.fillText('Cost: ' + details.coinCost + ' coin, ' + details.buildTime + ' seconds', (roundedX - 2) + modifier, (roundedY + 1) + 34);
      } else if (item != null && (item.getType() === "shiptemplate" || item.getType() === "shiptemplateGrayed")) {
        const template = this.templates[item.slotNum];
        context.strokeStyle = 'cyan';
        context.strokeRect(item.x, item.y, item.width, item.height);

        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.strokeRect((roundedX - 2) + modifier, (roundedY + 1), 200, 50);
        context.fillRect((roundedX - 2) + modifier, (roundedY + 1), 200, 50);

        context.fillStyle = 'black';
        context.textBaseline = 'top';
        context.font = '14px Perpetua';
        context.fillText(template.hull.toUpperCase(), (roundedX - 2) + modifier, (roundedY + 1));
        context.fillText(template.hardpoints, (roundedX - 2) + modifier, (roundedY + 1) + 20);
        context.fillText('Cost: ' + getStats(template).cost + ' coin, '
          + getStats(template).tcost + ' sec',
          (roundedX - 2) + modifier, (roundedY + 1) + 34);
      }
    }
  }

  getUnitButtons() {
    const result = [];
    if (this.getSelectedMapItems().length !== 0 && this.getSelectedMapItems().every(entity => entity.type === 'shipyard')) {
      result.push(new Shiptemplate('shiptemplate', this.x + 20, 250, 50, 50, 0,
        this.getSelectedMapItems()[0], this.templates[0]));
      result.push(new Shiptemplate('shiptemplate', this.x + 75, 250, 50, 50, 1,
        this.getSelectedMapItems()[0], this.templates[1]));
      result.push(new Shiptemplate('shiptemplate', this.x + 130, 250, 50, 50, 2,
        this.getSelectedMapItems()[0], this.templates[2]));
    } else {
      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 20, 250, 50, 50, 0, null, this.templates[0]));
      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 75, 250, 50, 50, 1, null, this.templates[1]));
      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 130, 250, 50, 50, 2, null, this.templates[2]));
    }

    result.push(new Shipyard('shipyard', this.x + 25, this.y + 175, 50, 50));
    result.push(new Mine('mine', this.x + 75, this.y + 175, 50, 50));

    result.push(new TargetToggle(this.map.getEntity(this.team).targetMode, this.x + 35, this.height - 75, 128, 26));
    result.push(new Shipbuilder('shipbuilder', this.x + 50, 350, 102, 26));
    return result;
  }

  getDesignerButtons() {
    const result = [];

    result.push(new Exit('exit', this.x + this.width - 20, this.y, 20, 20));

    result.push(new Template('template', this.x + 20, this.y + 25, 50, 50, 0, null, this.templates[0]));
    result.push(new Template('template', this.x + 75, this.y + 25, 50, 50, 1, null, this.templates[1]));
    result.push(new Template('template', this.x + 130, this.y + 25, 50, 50, 2, null, this.templates[2]));

    result.push(new Gunslot('gunslot', this.x + 75, this.y + 210, 40, 40, 0));
    result.push(new Gunslot('gunslot', this.x + 75, this.y + 350, 40, 40, 1));
    result.push(new Hullslot('hullslot', this.x + 75, this.y + 280, 40, 40, 1));

    if (this.selectedSlot != null) {
      if (this.selectedSlot.getType() === 'gunslot') {
        result.push(new Roundshot('roundshot', this.selectedSlot.x - 60, this.selectedSlot.y + 5, 40, 40));
        result.push(new Grapeshot('grapeshot', this.selectedSlot.x + 6, this.selectedSlot.y - 50, 40, 40));
        result.push(new Shell('shell', this.selectedSlot.x + 60, this.selectedSlot.y + 5, 40, 40));
        result.push(new Cancelshot('cancelshot', this.selectedSlot.x + 6, this.selectedSlot.y + 60, 40, 40));
      } else if (this.selectedSlot.getType() === 'hullslot') {
        result.push(new Gunboat('gunboat', this.selectedSlot.x - 60, this.selectedSlot.y + 5, 40, 40));
        result.push(new Frigate('frigate', this.selectedSlot.x + 5, this.selectedSlot.y - 45, 40, 40));
        result.push(new Galleon('galleon', this.selectedSlot.x + 60, this.selectedSlot.y + 5, 40, 40));
      }
    }

    result.push(new Save('save', this.x + 50, this.y + 77, 102, 26));


    for (const button of result) {
      button.setVisible(this.chosenIndex != null);

      if (button.getType() === 'template') {
        if (button.getSlotNum() === this.chosenIndex) {
          button.placeItem('templateSelected');
        } else {
          button.placeItem('template');
        }
      } else if (button.getType() === 'hullslot') {
        const ship = this.templates[this.chosenIndex];
        if (this.changing) {
          button.placeItem(this.workingTemplate.hull || 'hullslot');
        } else {
          button.placeItem(this.workingTemplate.hull || ship.hull || 'hullslot');
        }
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
    if (item == null) {
      this.selectedSlot = null;
      return;
    }

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
        this.selectedSlot = null;
        break;
      case 'gunslot':
      case 'hullslot':
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

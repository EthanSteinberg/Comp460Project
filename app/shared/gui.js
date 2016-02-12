import { statsDisplay } from './guibuttons/statsdisplay';
import buildingConstants from './buildingconstants';
import { getStats } from './template';

import Mine from './guibuttons/mine';
import Shipyard from './guibuttons/shipyard';
import Shiptemplate from './guibuttons/shiptemplate';
import Shipbuilder from './guibuttons/shipbuilder';
import Roundshot from './guibuttons/roundshot';
import Grapeshot from './guibuttons/grapeshot';
import Chainshot from './guibuttons/chainshot';
import Shell from './guibuttons/shell';
import TargetToggle from './guibuttons/targettoggle';

/**
 * A map of the game containing islands and all current ships.
 */
export default class Gui {

  constructor(canvasWidth, canvasHeight, templates, selectionState, map) {
    this.width = 200;
    this.height = canvasHeight;

    this.x = canvasWidth - this.width;
    this.y = 0;

    this.buttons = [
      // Temporarily disable mines
      // new Mine('mine', 1 + this.x, 1),
      new Shipyard('shipyard', this.x + 25, this.y + 175, 50, 50),
      new Shipbuilder('shipbuilder', this.x + 50, this.height - 75, 102, 26),
    ];

    this.templates = templates;

    this.selectionState = selectionState;

    this.map = map;
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
    context.fillStyle = 'gray';
    context.fillRect(this.x, this.y, this.width, this.height);

    if (this.getUnitButtons() != null) {
      this.drawUnitGuiBox(context, images);
    }

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
      button.render(context, images);
      button.selected = isSelected;
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

  drawUnitGuiBox(context) {
    for (let x = this.x; x < this.width + this.x; x++) {
      for (let y = this.y + this.height + 1; y < this.height + 5; y++) {
        context.fillStyle = 'gray';
        context.fillRect(x, y, 50, 50);
      }
    }

    if (this.getSelectedMapItems().length !== 0) {
      if (this.getSelectedMapItems().every(entity => entity.type === 'ship')) {
        this.getSelectedMapItems()[0].hardpoints.forEach((hardpointId, i) => {
          const hardpoint = this.map.getEntity(hardpointId);
          if (hardpoint != null && hardpoint.timeTillNextFire !== 0) {
            context.save();
            context.beginPath();
            context.rect((this.x + i), 7, 50, 50);
            context.clip();

            const angle = (100 - hardpoint.timeTillNextFire) / 100 * Math.PI * 2;

            context.globalCompositeOperation = 'multiply';
            context.fillStyle = 'rgba(0,0,0,.5)';
            context.beginPath();
            context.arc((this.x + i) + 25, 7 + 25, 50, 0, angle, true);
            context.lineTo((this.x + i) + 25, 7 + 25);
            context.fill();
            context.globalCompositeOperation = 'source-over';

            context.strokeStyle = 'white';
            context.beginPath();
            context.moveTo((this.x + i) + 25, 7 + 25);
            context.lineTo((this.x + i) + 25 + 50, 7 + 25);
            context.arc((this.x + i) + 25, 7 + 25, 50, 0, angle, true);
            context.lineTo((this.x + i) + 25, 7 + 25);
            context.stroke();

            context.restore();
          }
        });
      } 
    }
  }

  getUnitButtons() {
    const result = [];
    if (this.getSelectedMapItems().length !== 0 && this.getSelectedMapItems().every(entity => entity.type === 'shipyard')) {
      result.push(new Shiptemplate('shiptemplate', this.x + 25, 250, 50, 50, 0));
      result.push(new Shiptemplate('shiptemplate', this.x + 75, 250, 50, 50, 1));
      result.push(new Shiptemplate('shiptemplate', this.x + 125, 250, 50, 50, 2));
    } else {
      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 25, 250, 50, 50, 0));
      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 75, 250, 50, 50, 1));
      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 125, 250, 50, 50, 2));
    }

    result.push(new TargetToggle(this.map.getEntity(this.map.team).targetMode, this.x+35, 350, 128, 26));
    return result;
  }

  getButtons() {
    return this.buttons.concat(this.getUnitButtons() || []);
  }

  getItem(x, y) {
    for (const button of this.getButtons()) {
      if (button.isOver(x, y)) {
        return button;
      }
    }

    return null;
  }
}

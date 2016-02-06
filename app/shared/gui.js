import Button from './button';
import { statsDisplay } from './guibuttons/statsdisplay';
import buildingConstants from './buildingconstants';
import { getStats } from './template';

/**
 * A map of the game containing islands and all current ships.
 */
export default class Gui {

  constructor(canvasWidth, canvasHeight, templates, selectionState, map) {
    this.width = 8;
    this.height = 5;

    this.x = Math.round(canvasWidth / 50) - this.width;
    this.y = 0;

    this.buttons = [
      new Button('mine', 1 + this.x, 1),
      new Button('shipyard', this.x, 1),
      new Button('shipbuilder', 1 + this.x, 4),
      new Button('strategic', 2 + this.x, 4),
    ];

    this.templates = templates;

    this.selectionState = selectionState;

    this.map = map;
  }

  setSelectionState(newSelectionState) {
    this.selectionState = newSelectionState;
  }

  getSelectedMap() {
    return this.map.getEntity(this.selectionState.map);
  }

  /**
   * Render the gui
   */
  render(context, images, map, hoverCoords) {
    for (let x = this.x; x < this.width + this.x; x++) {
      for (let y = this.y; y < this.height; y++) {
        context.fillStyle = 'gray';
        context.fillRect(x * 50, y * 50, 50, 50);
      }
    }

    if (this.getUnitButtons() != null) {
      this.drawUnitGuiBox(context, images);
    }

    const moneyText = Math.floor(map.getEntity(this.map.team).coins).toString();

    context.fillStyle = 'black';
    context.textBaseline = 'top';
    context.font = '24px sans-serif';
    context.fillText(moneyText, (this.x * 50) + 30, (this.y * 50) + 5);

    const width = context.measureText(moneyText).width;

    context.strokeStyle = 'black';
    context.strokeRect(this.x * 50, this.y * 50, width + 40, 35);
    context.drawImage(images.money, (this.x * 50), (this.y * 50) + 5, 25, 25);

    for (const button of this.getButtons()) {
      const isSelected = this.selectionState.gui != null && this.selectionState.gui.type === button.type &&
        this.selectionState.gui.templateNum === button.templateNum;
      button.render(context, images, isSelected);
    }

    if (this.getSelectedMap() != null) {
      if (this.getSelectedMap().type === 'ship') {
        this.getSelectedMap().hardpoints.forEach((hardpointId, i) => {
          const hardpoint = map.getEntity(hardpointId);
          if (hardpoint != null && hardpoint.timeTillNextFire !== 0) {
            context.save();
            context.rect((this.x + i) * 50, 7 * 50, 50, 50);
            context.clip();

            const angle = (100 - hardpoint.timeTillNextFire) / 100 * Math.PI * 2;

            context.globalCompositeOperation = 'multiply';
            context.fillStyle = 'rgba(0,0,0,.5)';
            context.beginPath();
            context.arc((this.x + i) * 50 + 25, 7 * 50 + 25, 50, 0, angle, true);
            context.lineTo((this.x + i) * 50 + 25, 7 * 50 + 25);
            context.fill();
            context.globalCompositeOperation = 'source-over';

            context.strokeStyle = 'white';
            context.beginPath();
            context.moveTo((this.x + i) * 50 + 25, 7 * 50 + 25);
            context.lineTo((this.x + i) * 50 + 25 + 50, 7 * 50 + 25);
            context.arc((this.x + i) * 50 + 25, 7 * 50 + 25, 50, 0, angle, true);
            context.lineTo((this.x + i) * 50 + 25, 7 * 50 + 25);
            context.stroke();

            context.restore();
          }
        });
      } else if (this.getSelectedMap().type === 'shipyard') {
        if (this.selectionState.gui != null && this.selectionState.gui.type === 'shiptemplate') {
          const template = this.templates[this.selectionState.gui.templateNum];
          statsDisplay((this.x + 3.5) * 50, (this.y + 6.25) * 50, getStats(template), context, images);
        }
      }
    }

    if (hoverCoords != null) {
      const roundedX = Math.floor(hoverCoords.x / 50);
      const roundedY = Math.floor(hoverCoords.y / 50);

      const item = this.getItem(roundedX, roundedY);

      if (item != null && item.isBuilding()) {
        const buildingType = item.getBuilding();

        const details = buildingConstants[buildingType];

        // Display a tooltip
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.strokeRect((roundedX - 2) * 50, (roundedY + 1) * 50, 200, 50);
        context.fillRect((roundedX - 2) * 50, (roundedY + 1) * 50, 200, 50);

        context.fillStyle = 'black';
        context.textBaseline = 'top';
        context.font = '14px sans-serif';
        context.fillText(details.name, (roundedX - 2) * 50, (roundedY + 1) * 50);
        context.fillText(details.description, (roundedX - 2) * 50, (roundedY + 1) * 50 + 20);
        context.fillText('Cost: ' + details.coinCost + ' coin, ' + details.buildTime + ' seconds', (roundedX - 2) * 50, (roundedY + 1) * 50 + 34);
      }
    }
  }

  drawUnitGuiBox(context) {
    for (let x = this.x; x < this.width + this.x; x++) {
      for (let y = this.y + this.height + 1; y < this.height + 5; y++) {
        context.fillStyle = 'gray';
        context.fillRect(x * 50, y * 50, 50, 50);
      }
    }
  }

  getUnitButtons() {
    if (this.getSelectedMap() == null) {
      return null;
    } else if (this.getSelectedMap().type === 'ship') {
      const result = [];

      for (let i = 0; i < this.getSelectedMap().hardpoints.length; i++) {
        const hardpoint = this.map.getEntity(this.getSelectedMap().hardpoints[i]);
        if (hardpoint != null) {
          result.push(new Button(hardpoint.gunType, this.x + i, 7, hardpoint.id));
        }
      }
      return result;
    } else if (this.getSelectedMap().type === 'shipyard') {
      return [
        new Button('shiptemplate', this.x, 7, 0),
        new Button('shiptemplate', this.x + 1, 7, 1),
        new Button('shiptemplate', this.x + 2, 7, 2),
      ];
    }
  }

  getButtons() {
    return this.buttons.concat(this.getUnitButtons() || []);
  }

  getItem(x, y) {
    for (const button of this.getButtons()) {
      if (button.getX() === x && button.getY() === y) {
        return button;
      }
    }

    return null;
  }
}

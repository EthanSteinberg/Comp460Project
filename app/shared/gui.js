import Button from './button';
import StatsDisplay from './guibuttons/statsdisplay';
import Stats from './stats';
import buildingConstants from './buildingconstants';


/**
 * A map of the game containing islands and all current ships.
 */
export default class Gui {

  constructor(canvasWidth, canvasHeight) {
    this.width = 8;
    this.height = Math.round(canvasHeight/50);

    this.x = Math.round(canvasWidth/50) - this.width;
    this.y = 0;

    this.buttons = [
      new Button('mine', 1+this.x, 1), 
      new Button('shipyard', 1+this.x, 3),
      new Button('shipbuilder',1+this.x, 6)
    ];
    this.statsdisplay = new StatsDisplay("statsdisplay", (this.x+3)*50, (this.y+3)*50, 50, 50);

    this.templates = [];

    this.grid = {};

    this.displayStats = false;

    this.stats = null;
    this.templateStats = new Map();

    this._initGrid();
  }

  _initGrid() {
    for (const button of this.buttons) {
      this.grid[button.getX() + ',' + button.getY()] = button;
    }
    console.log(this.grid);
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

    context.fillStyle = 'black';
    context.textBaseline = 'top';
    context.font = '24px sans-serif';
    context.fillText(Math.floor(map.getCoins()).toString(), (this.x*50) + 30, (this.y*50) + 5);

    const width = context.measureText('100').width;

    context.strokeStyle = 'black';
    context.strokeRect(this.x*50, this.y*50, width + 40, 35);
    context.drawImage(images.money, (this.x*50), (this.y*50) + 5, 25, 25);

    if (this.displayStats) {
      var selectedTemplate;
      for (const template of this.templates) {
        if (template.isSelected) {
          selectedTemplate = template;
          var num = template.getTemplateNum();
          this.stats = this.templateStats.get(num);
        }
      }

      if (this.stats != null) {   
        this.statsdisplay.setStats(this.stats);
        this.statsdisplay.render(context, images);
      } else if (selectedTemplate != null) {
        context.font = '20px Courier New';
        context.fillText('No template in', (this.x+3)*50, (this.y+4)*50);
        context.fillText('this save slot.', (this.x+3)*50, (this.y+5)*50);
      }

    }

    for (const button of this.buttons) {
      button.render(context, images);
    }

    for (const template of this.templates) {
      if (template != undefined) {
        template.render(context, images);
      }
    }
  }

  getItem(x, y) {
    return this.grid[x + ',' + y];
  }

  displayShipStats(stats){
    this.stats = Object.setPrototypeOf(stats, Stats.prototype);
    this.displayStats = true;
  }

  removeShipStats(){
    this.displayStats = false;
  }

  addStats(stats) {
    var num = stats.getTemplateNum();
    if (num != 'None') {
      this.templateStats.set(num, stats);
    }
  }

  getStats() {
    for (const template of this.templates) {
      if (template.isSelected) {
        var num = template.getTemplateNum();
        return this.templateStats.get(num);
      }
    }
  }

  displayShipyard() {
    console.log("displayShipyard")
    this.displayStats = true;
    this.templates.push(new Button('shiptemplate', this.x, 5, 1));
    this.templates.push(new Button('shiptemplate', this.x+1, 5, 2));
    this.templates.push(new Button('shiptemplate', this.x+2, 5, 3));

    for (const template of this.templates) {
      this.grid[template.getX() + ',' + template.getY()] = template;
    }
  }

  removeShipyardDisplay() {
    console.log("removeShipyardDisplay")
    this.displayStats = false;

    while(this.templates.length > 0) {
      var template = this.templates.pop();
      this.grid[template.getX() + ',' + template.getY()] = null;
    }
  }
}

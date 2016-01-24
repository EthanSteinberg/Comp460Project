import Button from './button';
import {MAP_WIDTH} from './gamemap';
import {MAP_HEIGHT} from './gamemap';
import StatsDisplay from './guibuttons/statsdisplay';
import Stats from './stats';


/**
 * A map of the game containing islands and all current ships.
 */
export default class Gui {

  constructor() {
    this.buttons = [
      new Button('mine', 1+MAP_WIDTH, 1), 
      new Button('shipyard', 1+MAP_WIDTH, 3),
      new Button('shipbuilder',1+MAP_WIDTH, 6)
    ];
    this.statsdisplay = new StatsDisplay("statsdisplay", 570, 150, 50, 50);

    this.templates = [];

    this.grid = {};

    this._initGrid();

    this.width = 8;
    this.height = 8;
    this.displayStats = false;

    this.stats = null;
    this.templateStats = new Map();
  }

  _initGrid() {
    for (const button of this.buttons) {
      this.grid[button.getX() + ',' + button.getY()] = button;
    }
  }

  /**
   * Render the gui
   */
  render(context, images) {
    for (let x = MAP_WIDTH; x < this.width + MAP_WIDTH; x++) {
      for (let y = 0; y < this.height; y++) {
        context.fillStyle = 'gray';
        context.fillRect(x * 50, y * 50, 50, 50);
      }
    }

    context.fillStyle = 'black';
    context.textBaseline = 'top';
    context.font = '24px sans-serif';
    context.fillText('100', 435, 6);

    const width = context.measureText('100').width;

    context.strokeStyle = 'black';
    context.strokeRect(400, 1, width + 40, 35);
    context.drawImage(images.money, 405, 6, 25, 25);

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
        context.fillText('No template in', 600, 170);
        context.fillText('this save slot.', 600, 190);
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
    this.templates.push(new Button('shiptemplate', MAP_WIDTH, 5, 1));
    this.templates.push(new Button('shiptemplate', MAP_WIDTH+1, 5, 2));
    this.templates.push(new Button('shiptemplate', MAP_WIDTH+2, 5, 3));

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

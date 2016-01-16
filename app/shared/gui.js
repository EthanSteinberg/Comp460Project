import Button from './button';
import {MAP_WIDTH} from './gamemap';
import {MAP_HEIGHT} from './gamemap';


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

    this.grid = {};

    this._initGrid();

    this.width = 3;
    this.height = 8;
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

    for (const button of this.buttons) {
      button.render(context, images);
    }
  }

  getItem(x, y) {
    return this.grid[x + ',' + y];
  }

  displayShipyard() {
    this.buttons.push(new Button('shiptemplate', MAP_WIDTH, 5));
    for (const button of this.buttons) {
      this.grid[button.getX() + ',' + button.getY()] = button;
    }
  }

  removeShipyardDisplay() {
    for(var i = this.buttons.length - 1; i >= 0; i--) {
      if(this.buttons[i].getType() === 'shiptemplate') {
         this.grid[this.buttons[i].getX() + ',' + this.buttons[i].getY()] = null;
         this.buttons.splice(i, 1);
      }
    }
  }
}

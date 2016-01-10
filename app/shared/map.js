import Ship from './ship';

/**
 * A map of the game containing islands and all current ships.
 */
export default class Map {

  constructor() {
    this.islands = [
      [1, 1],
      [1, 2],
      [2, 1],
      [2, 2],
    ];

    this.ships = [new Ship(this, 0, 0)];

    this.grid = {};

    this._initGrid();

    this.width = 8;
    this.height = 8;
  }

  _initGrid() {
    for (const ship of this.ships) {
      this.grid[ship.getX() + ',' + ship.getY()] = ship;
    }
  }

  updatePosition(item, oldPosition, newPosition) {
    this.grid[oldPosition.x + ',' + oldPosition.y] = null;
    this.grid[newPosition.x + ',' + newPosition.y] = item;
  }

  /**
   * Render both the map and all ships on it.
   */
  render(context, images) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        context.fillStyle = 'blue';
        context.fillRect(x * 50, y * 50, 50, 50);
        context.strokeRect(x * 50, y * 50, 50, 50);
      }
    }

    for (const [x, y] of this.islands) {
      context.fillStyle = 'green';
      context.fillRect(x * 50, y * 50, 50, 50);
    }

    for (const ship of this.ships) {
      ship.render(context, images);
    }
  }

  getItem(x, y) {
    return this.grid[x + ',' + y];
  }

  isIsland(x, y) {
    for (const [iX, iY] of this.islands) {
      if (x === iX && y === iY) {
        return true;
      }
    }
    return false;
  }

  tick() {
    for (const ship of this.ships) {
      ship.tick();
    }
  }
}

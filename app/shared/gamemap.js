import Ship from './ship';
import Mine from './mine';
import Shipyard from './shipyard';


export const MAP_WIDTH = 8;
export const MAP_HEIGHT = 8;

/**
 * A map of the game containing islands and all current ships.
 */
export default class GameMap {

  constructor() {
    this.islands = [
      [1, 1],
      [1, 2],
      [2, 1],
      [2, 2],
    ];

    this.ships = new Map();

    this.buttons = [];

    this.mines = new Map();
    this.shipyards = new Map();


    this.grid = {};

    this.addShip(new Ship(this, 0, 4));
    this.addShip(new Ship(this, 4, 4));

    this.width = MAP_WIDTH;
    this.height = MAP_HEIGHT;
  }

  addShip(ship) {
    this.ships.set(ship.getId(), ship);
  }

  getShip(shipId) {
    return this.ships.get(shipId);
  }

  /**
   * Render both the map and all ships on it.
   */
  render(context, images) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        context.fillStyle = 'blue';
        context.fillRect((x - 0.5) * 50, (y - 0.5) * 50, 50, 50);
        context.strokeRect((x - 0.5) * 50, (y - 0.5) * 50, 50, 50);
      }
    }

    for (const [x, y] of this.islands) {
      context.fillStyle = 'green';
      context.fillRect((x - 0.5) * 50, (y - 0.5) * 50, 50, 50);
    }

    for (const ship of this.ships.values()) {
      ship.render(context, images);
    }

    for (const mine of this.mines.values()) {
      mine.render(context, images);
    }

    for (const shipyard of this.shipyards.values()) {
      shipyard.render(context, images);
    }
  }

  getItem(x, y) {
    if (this.grid[Math.round(x) + ',' + Math.round(y)] != null) {
      return this.grid[Math.round(x) + ',' + Math.round(y)];
    }

    for (const ship of this.ships.values()) {
      const distanceSquared = (ship.getX() - x) * (ship.getX() - x) + (ship.getY() - y) * (ship.getY() - y);
      const distance = Math.sqrt(distanceSquared);
      if (distance <= 0.5) {
        return ship;
      }
    }

    return null;
  }

  isIsland(x, y) {
    for (const [iX, iY] of this.islands) {
      if (x === iX && y === iY) {
        return true;
      }
    }
    return false;
  }

  addBuilding(type, x, y) {
    switch(type) {
      case 'mine': 
        var mine = new Mine(this, x, y);
        this.mines.set(mine.getId(), mine);
        this.grid[mine.getX() + ',' + mine.getY()] = mine;
        break;
      case 'shipyard': 
        var shipyard = new Shipyard(this, x, y);
        this.shipyards.set(shipyard.getId(), shipyard);
        this.grid[shipyard.getX() + ',' + shipyard.getY()] = shipyard;
        break;
    }
  }

  getShips() {
    return [...this.ships.values()];
  }

  /**
   * Update the map and get the corresponding update messages.
   */
  getUpdateMessages() {
    const result = [];
    for (const ship of this.ships.values()) {
      result.push(...ship.getUpdateMessages());
    }
    for (const mine of this.mines.values()) {
      result.push(...mine.getUpdateMessages());
    }
    for (const shipyard of this.shipyards.values()) {
      result.push(...shipyard.getUpdateMessages());
    }
    return result;
  }
}

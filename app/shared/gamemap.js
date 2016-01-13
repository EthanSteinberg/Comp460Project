import Ship from './ship';
import Mine from './mine';
import Shipyard from './shipyard';
import Island from './island';

export const MAP_WIDTH = 8;
export const MAP_HEIGHT = 8;

/**
 * A map of the game containing islands and all current ships.
 */
export default class GameMap {

  constructor() {
    this.islands = new Map();

    this.ships = new Map();

    this.buttons = [];

    this.mines = new Map();
    this.shipyards = new Map();

    this.grid = {};

    this.addShip(new Ship(this, 0, 4));
    this.addShip(new Ship(this, 4, 4));

    var island1coordinates = [
      [1, 1],
      [1, 2],
      [2, 1],
      [2, 2],
    ];
    this.addIsland(new Island(this, island1coordinates));

    this.width = MAP_WIDTH;
    this.height = MAP_HEIGHT;
  }

  addShip(ship) {
    this.ships.set(ship.getId(), ship);
  }

  addIsland(island) {
    this.islands.set(island.getId(), island);
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

    for (const island of this.islands.values()) {
      island.render(context);
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
    for (const island of this.islands.values()) {
      if (island.isIsland(x,y)) {
        return true;
      }
    }
    return false;
  }

  isNextToIsland(islandID, x, y) {
    var island = this.islands.get(islandID);
    return island.isNextToIsland(x, y);
  }

  getIsland(x, y) {
    for (const island of this.islands.values()) {
      if (island.isIsland(x,y)) {
        return island.getId();
      }
    }
    return -1;
  }

  addBuilding(type, x, y, islandID) {
    switch(type) {
      case 'mine': 
        var mine = new Mine(this, x, y);
        this.mines.set(mine.getId(), mine);
        this.grid[mine.getX() + ',' + mine.getY()] = mine;
        break;
      case 'shipyard': 
        var shipyard = new Shipyard(this, x, y, islandID);
        this.shipyards.set(shipyard.getId(), shipyard);
        this.grid[shipyard.getX() + ',' + shipyard.getY()] = shipyard;
        break;
      case 'shiptemplate': 
        this.addShip(new Ship(this, x, y));
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

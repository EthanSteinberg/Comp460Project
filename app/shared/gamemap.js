import Ship from './ship';
import Mine from './mine';
import Shipyard from './shipyard';
import Island from './island';
import MiniView from './miniview';

export const MAP_WIDTH = 8;
export const MAP_HEIGHT = 8;

const SCALE = 3;

/**
 * A map of the game containing islands and all current ships.
 */
export default class GameMap {

  constructor() {
    this.miniview = new MiniView('miniview');

    this.islands = new Map();

    this.ships = new Map();

    this.buttons = [];

    this.mines = new Map();
    this.shipyards = new Map();

    this.grid = {};

    this.mode = 'strategic';

    const template = {
      hull: 'gunboat',
      hardpoints: ['roundshot'],
    };

    this.addShip(new Ship(this, 0, 4, template));
    this.addShip(new Ship(this, 4, 4, template));

    const island1coordinates = [
      [1, 1],
      [1, 2],
      [2, 1],
      [2, 2],
    ];
    this.addIsland(new Island(this, island1coordinates));

    this.width = MAP_WIDTH;
    this.height = MAP_HEIGHT;

    this.coins = 100; // Start with 100 coin.
  }

  setMode(mode) {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  setCoins(coins) {
    this.coins = coins;
  }

  getCoins() {
    return this.coins;
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

  removeShip(shipId) {
    this.ships.delete(shipId);
  }

  /**
   * Render both the map and all ships on it.
   */
  render(context, images) {
    if (this.mode == 'tactical') {
      context.scale(SCALE,SCALE);
      this.renderMap(context, images);
    } else {
      this.renderMap(context, images);
    }
  }

  renderMiniMap(context, images, x, y, width, height) {
    this.renderMap(context, images);

    if (this.mode == 'tactical') {
      this.miniview.render(context, images, x, y, width, height, SCALE);
    }
  }

  renderMap(context, images) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        context.fillStyle = 'blue';
        context.strokeStyle = 'black';
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

  /**
   * Get an item on the map at a given x y position.
   * If forAttack is provided, it gets items for attacking.
   * In particular, this allows you to target ship hardpoints while you
   * cannot select hardpoints yourself.
   */
  getItem(x, y, forAttack = false) {
    if (this.grid[Math.round(x) + ',' + Math.round(y)] != null) {
      return this.grid[Math.round(x) + ',' + Math.round(y)];
    }

    for (const ship of this.ships.values()) {
      const distanceSquared = (ship.getX() - x) * (ship.getX() - x) + (ship.getY() - y) * (ship.getY() - y);
      const distance = Math.sqrt(distanceSquared);
      if (distance <= 0.5) {
        if (forAttack && ship.getHardpoint(x, y) != null) {
          return ship.getHardpoint(x, y);
        }
        return ship;
      }
    }

    return null;
  }

  setView(mouseX, mouseY) {
    return this.miniview.setView(mouseX, mouseY, MAP_WIDTH*50, MAP_HEIGHT*50);
  }

  isIsland(x, y) {
    for (const island of this.islands.values()) {
      if (island.isIsland(x, y)) {
        return true;
      }
    }
    return false;
  }

  isNextToIsland(islandID, x, y) {
    const island = this.islands.get(islandID);
    return island.isNextToIsland(x, y);
  }

  getIsland(x, y) {
    for (const island of this.islands.values()) {
      if (island.isIsland(x, y)) {
        return island.getId();
      }
    }
    return -1;
  }

  addBuilding(type, x, y, islandID, template) {
    switch (type) {
      case 'mine':
        const mine = new Mine(this, x, y);
        this.mines.set(mine.getId(), mine);
        this.grid[mine.getX() + ',' + mine.getY()] = mine;
        break;
      case 'shipyard':
        const shipyard = new Shipyard(this, x, y, islandID);
        this.shipyards.set(shipyard.getId(), shipyard);
        this.grid[shipyard.getX() + ',' + shipyard.getY()] = shipyard;
        break;
      case 'ship':
        this.addShip(new Ship(this, x, y, template));
        break;
      default:
        console.error('Unexpected building type: ', type);
    }
  }

  getShips() {
    return [...this.ships.values()];
  }

  getBuilding(id, type) {
    switch (type) {
      case 'shipyard':
        return this.shipyards.get(id);
      case 'mine':
        return this.mines.get(id);
      default:
        console.error('Unexpected building type: ', type);
    }
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

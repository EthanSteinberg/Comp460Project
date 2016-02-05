import * as Ships from './ship';
import * as Projectiles from './projectile';
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

    this.entities = new Map();
    if (typeof window !== 'undefined') { window.entities = this.entities; }
    this.nextEntityId = 0;

    this.islands = new Map();

    this.mines = new Map();
    this.shipyards = new Map();

    this.grid = {};

    this.mode = 'strategic';

    const template = {
      hull: 'gunboat',
      hardpoints: ['roundshot'],
    };

    Ships.createShipAndHardpoints(this, 0, 4, template);
    Ships.createShipAndHardpoints(this, 4, 4, template);

    const island1coordinates = [
      [1, 1],
    ];
    this.addIsland(new Island(this, island1coordinates));
    const island2coordinates = [
      [6, 6],
    ];
    this.addIsland(new Island(this, island2coordinates));

    this.width = MAP_WIDTH;
    this.height = MAP_HEIGHT;

    this.coins = 100; // Start with 100 coin.

    this.hardpoints = new Map();
  }

  addEntity(entity) {
    this.entities.set(entity.id, entity);
  }

  removeEntity(entityId) {
    if (typeof entityId !== 'string') {
      console.error('Bad entitity id', entityId);
    }
    this.entities.delete(entityId);
  }

  getEntity(entityId) {
    return this.entities.get(entityId);
  }

  getNextEntityId() {
    const id = this.nextEntityId++;
    return '' + id;
  }

  addHardpoint(hardpoint) {
    this.hardpoints.set(hardpoint.getId(), hardpoint);
  }

  getHardpoint(hardpointId) {
    return this.hardpoints.get(hardpointId);
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

  addIsland(island) {
    this.entities.set(island.getId(), island);
    this.islands.set(island.getId(), island);
  }

  /**
   * Render both the map and all ships on it.
   */
  render(context, images, selectionState) {
    if (this.mode === 'tactical') {
      context.scale(SCALE, SCALE);
      this.renderMap(context, images, selectionState);
    } else {
      this.renderMap(context, images, selectionState);
    }
  }

  renderMiniMap(context, images, x, y, width, height) {
    this.renderMap(context, images, { gui: null, map: null });

    if (this.mode === 'tactical') {
      this.miniview.render(context, images, x, y, width, height, SCALE);
    }
  }

  renderMap(context, images, selectionState) {
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

    for (const entity of this.entities.values()) {
      if (entity.type === 'ship') {
        const isSelected = selectionState.map === entity.id;
        Ships.render(entity, this, context, images, isSelected);
      } else if (entity.type === 'projectile') {
        Projectiles.render(entity, this, context, images);
      }
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
  getItem(x, y) {
    if (this.grid[Math.round(x) + ',' + Math.round(y)] != null) {
      return this.grid[Math.round(x) + ',' + Math.round(y)];
    }

    for (const entity of this.entities.values()) {
      if (entity.type === 'ship') {
        const distanceSquared = (entity.x - x) * (entity.x - x) + (entity.y - y) * (entity.y - y);
        const distance = Math.sqrt(distanceSquared);
        if (distance <= 0.5) {
          return entity;
        }
      }
    }

    return null;
  }

  setView(mouseX, mouseY) {
    return this.miniview.setView(mouseX, mouseY, MAP_WIDTH * 50, MAP_HEIGHT * 50);
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
        this.entities.set(mine.getId(), mine);
        this.mines.set(mine.getId(), mine);
        this.grid[mine.getX() + ',' + mine.getY()] = mine;
        break;
      case 'shipyard':
        const shipyard = new Shipyard(this, x, y, islandID);
        this.entities.set(shipyard.getId(), shipyard);
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
    return [...this.entities.values()].filter(a => a.type === 'ship');
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

    for (const entity of this.entities.values()) {
      if (entity.type === 'ship') {
        Ships.processUpdate(entity, this);
      } else if (entity.type === 'projectile') {
        Projectiles.processUpdate(entity, this);
      }
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

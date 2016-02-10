import * as Ships from './ship';
import * as Projectiles from './projectile';
import * as Mines from './mine';
import * as Shipyards from './shipyard';
import * as Hardpoints from './hardpoint';
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
    this.nextEntityId = 2;

    this.entities.set('0', {
      id: '0',
      type: 'playerstate',
      coins: 100,
    });

    this.entities.set('1', {
      id: '1',
      type: 'playerstate',
      coins: 100,
    });

    this.islands = new Map();

    this.team = null;

    this.mode = 'strategic';

    const template = {
      hull: 'gunboat',
      hardpoints: ['roundshot'],
    };

    Ships.createShipAndHardpoints(this, 0, 4, template, '0');
    Ships.createShipAndHardpoints(this, 4, 4, template, '1');

    const island1coordinates = [
      [1, 1],
    ];
    this.addIsland(new Island(this, island1coordinates, '0'));
    const island2coordinates = [
      [6, 6],
    ];
    this.addIsland(new Island(this, island2coordinates, '1'));

    this.width = MAP_WIDTH;
    this.height = MAP_HEIGHT;
  }

  getInitialState() {
    return [...this.entities];
  }

  init(initialState) {
    this.entities = new Map();

    for (const [key, value] of initialState) {
      this.entities.set(key, value);
    }
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
    if (typeof windows !== 'undefined') {
      console.error('You are trying to create something on the client. Do not do that.');
    }

    const id = this.nextEntityId++;
    return '' + id;
  }

  setMode(mode) {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  addIsland(island) {
    this.islands.set(island.getId(), island);
  }

  getIslands() {
    return [...this.islands.values()];
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
    this.renderMap(context, images, { gui: null, map: [] });

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
      const isSelected = selectionState.map.indexOf(entity.id) !== -1;

      if (entity.type === 'ship') {
        Ships.render(entity, this, context, images, isSelected, selectionState.gui);
      } else if (entity.type === 'projectile') {
        Projectiles.render(entity, this, context, images, isSelected);
      } else if (entity.type === 'shipyard') {
        Shipyards.render(entity, this, context, images, isSelected);
      } else if (entity.type === 'mine') {
        Mines.render(entity, this, context, images, isSelected);
      }
    }
  }

  /**
   * Get an item on the map at a given x y position.
   * If forAttack is provided, it gets items for attacking.
   * In particular, this allows you to target ship hardpoints while you
   * cannot select hardpoints yourself.
   */
  getItem(x, y) {
    for (const entity of this.entities.values()) {
      if (entity.type === 'ship') {
        const distanceSquared = (entity.x - x) * (entity.x - x) + (entity.y - y) * (entity.y - y);
        const distance = Math.sqrt(distanceSquared);
        if (distance <= 0.5) {
          return entity;
        }
      } else if (entity.type === 'shipyard' || entity.type === 'mine') {
        if (Math.round(x) === entity.x && Math.round(y) === entity.y) {
          return entity;
        }
      }
    }

    return null;
  }

  interecting(x1, y1, x2, y2, entity) {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    const dx = x2 - x1;
    const dy = y2 - y1;

    const xDist = Math.abs(entity.x - centerX);
    const yDist = Math.abs(entity.y - centerY);

    if (xDist < dx / 2) {
      return yDist < (0.5 + dy / 2);
    }

    if (yDist < dy / 2) {
      return xDist < (0.5 + dx / 2);
    }

    const distanceToCorner = Math.sqrt((xDist - dx / 2) * (xDist - dx / 2) + (yDist - dy / 2) * (yDist - dy / 2));

    return distanceToCorner < 0.5;
  }

  getItemsWithinRectangle(x1, y1, x2, y2) {
    const result = [];

    for (const entity of this.entities.values()) {
      if (entity.type === 'ship') {
        if (this.interecting(x1, y1, x2, y2, entity)) {
          result.push(entity.id);
        }
      }
    }

    return result;
  }

  getHardpointItem(x, y) {
    for (const entity of this.entities.values()) {
      if (entity.type === 'hardpoint') {
        const position = Hardpoints.getPosition(entity, this);
        const distanceSquared = (position.x - x) * (position.x - x) + (position.y - y) * (position.y - y);
        const distance = Math.sqrt(distanceSquared);
        if (distance <= entity.radius) {
          return entity;
        }
      }
    }

    return null;
  }

  getShipHardpointItem(enemyShipId) {
    for (const entity of this.entities.values()) {
      if (entity.type === 'hardpoint') {
        if (entity.shipId === enemyShipId) {
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
        return island;
      }
    }
    return -1;
  }

  getIslandById(islandID) {
    return this.islands.get(islandID);
  }

  getShipBuildCoords(islandID) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.isNextToIsland(islandID, x, y)) {
          var flag = true;
          for (const entity of this.entities.values()) {
            if (entity.x == x && entity.y == y) {
              flag = false;
            }
          }

          if (flag) {
            return { x, y }
          } 
        }
      }
    }

    return { null, null }
  }

  addBuilding(type, x, y, islandID, team) {
    switch (type) {
      case 'mine':
        Mines.createMine(this, x, y);
        break;
      case 'shipyard':
        Shipyards.createShipyard(this, x, y, islandID, team);
        this.getIsland(x, y).team = team;
        break;
      default:
        console.error('Unexpected building type: ', type);
    }
  }

  getShips() {
    return [...this.entities.values()].filter(a => a.type === 'ship');
  }

  /**
   * Update the map and get the corresponding update messages.
   */
  processUpdate() {
    for (const team of ['0', '1']) {
      this.getEntity(team).coins += 0.2;
    }

    for (const entity of this.entities.values()) {
      if (entity.type === 'ship') {
        Ships.processUpdate(entity, this);
      } else if (entity.type === 'projectile') {
        Projectiles.processUpdate(entity, this);
      } else if (entity.type === 'shipyard') {
        Shipyards.processUpdate(entity, this);
      } else if (entity.type === 'mine') {
        Mines.processUpdate(entity, this);
      }
    }
  }
}

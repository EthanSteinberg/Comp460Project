import * as Ships from './ship';
import * as Projectiles from './projectile';
import * as Mines from './mine';
import * as Shipyards from './shipyard';
import * as Hardpoints from './hardpoint';
import * as Islands from './island';
import * as BuildingTemplates from './buildingtemplate';
import MiniView from './miniview';

export const MAP_WIDTH = 12;
export const MAP_HEIGHT = 12;

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
      targetMode: 'hull',
    });

    this.entities.set('1', {
      id: '1',
      type: 'playerstate',
      coins: 100,
      targetMode: 'hull',
    });

    this.team = null;

    const template = {
      hull: 'gunboat',
      hardpoints: ['roundshot'],
    };

    Ships.createShipAndHardpoints(this, 0, 3, template, '0');
    Ships.createShipAndHardpoints(this, 8, 8, template, '1');

    const island1coordinates = [
      [1, 1],
      [1, 2],
    ];
    Islands.createIsland(this, island1coordinates);
    const island2coordinates = [
      [10, 9],
      [10, 10],
    ];
    Islands.createIsland(this, island2coordinates);

    const island3coordinates = [
      [5, 5],
    ];
    Islands.createIsland(this, island3coordinates);

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
        // Show grid
        // context.strokeRect((x - 0.5) * 50, (y - 0.5) * 50, 50, 50);
      }
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
      } else if (entity.type === 'island') {
        Islands.render(entity, this, context, images);
      } else if (entity.type === 'buildingTemplate') {
        BuildingTemplates.render(entity, this, context, images);
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

  isNextToIsland(islandID, x, y) {
    const island = this.getEntity(islandID);
    return Islands.isNextToIsland(island, x, y);
  }

  getIsland(x, y) {
    for (const island of this.entities.values()) {
      if (island.type === 'island' && Islands.isIsland(island, x, y)) {
        return island;
      }
    }
    return null;
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
            return { x, y };
          }
        }
      }
    }

    return { x: null, y: null };
  }

  addBuilding(type, x, y, islandID, team) {
    switch (type) {
      case 'mine':
        Mines.createMine(this, x, y, islandID, team);
        break;
      case 'shipyard':
        Shipyards.createShipyard(this, x, y, islandID, team);
        break;
      default:
        console.error('Unexpected building type: ', type);
    }
  }

  getShips() {
    return [...this.entities.values()].filter(a => a.type === 'ship');
  }

  getIslands() {
    return [...this.entities.values()].filter(a => a.type === 'island');
  }

  /**
   * Update the map and get the corresponding update messages.
   */
  processUpdate() {
    for (const entity of this.entities.values()) {
      if (entity.type === 'ship') {
        Ships.processUpdate(entity, this);
      } else if (entity.type === 'projectile') {
        Projectiles.processUpdate(entity, this);
      } else if (entity.type === 'shipyard') {
        Shipyards.processUpdate(entity, this);
      } else if (entity.type === 'mine') {
        Mines.processUpdate(entity, this);
      } else if (entity.type === 'island') {
        Islands.processUpdate(entity, this);
      } else if (entity.type === 'buildingTemplate') {
        BuildingTemplates.processUpdate(entity, this);
      }
    }
  }
}

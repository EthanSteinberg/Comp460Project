import * as Mines from './mine';
import * as Shipyards from './shipyard';
import * as Hardpoints from './hardpoint';
import * as Islands from './island';
import Types from './types';

/**
 * A map of the game containing islands and all current ships.
 */
export default class GameMap {

  constructor(initialState) {
    const { entries, width, height } = initialState;

    this.entities = new Map();
    this.nextEntityId = 2;

    for (const value of entries) {
      this.addEntity(value);
    }

    this.width = width;
    this.height = height;
  }

  getInitialState() {
    return {
      entries: [...this.entities.values()],
      width: this.width,
      height: this.height,
    };
  }

  updateEntity(entity) {
    if (!this.entities.has(entity.id)) {
      console.error('Updating an entity which does not exist: ', entity);
    }

    this.entities.set(entity.id, entity);
  }

  addEntity(entity) {
    if (this.entities.has(entity.id)) {
      console.error('Adding an entity which already exists: ', entity);
    }

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
    this.renderMap(context, images, selectionState);
  }

  renderMiniMap(context, images, x, y, width, height) {
    this.renderMap(context, images, { gui: null, map: [] }, 5, this.width / 3);

    if (x != null) {
      context.globalCompositeOperation = 'multiply';
      context.fillStyle = 'rgba(0,0,0,.5)';
      context.fillRect(-25, -25, this.width * 50, y);

      context.fillRect(-25, y - 25, x, height);

      context.fillRect(-25 + x + width, y - 25, this.width * 50 - x - width, height);

      context.fillRect(-25, -25 + y + height, this.width * 50, this.height * 50 - y - height);

      context.globalCompositeOperation = 'source-over';
    }
  }

  countPlayerItems() {
    const result = {
      '0': 0,
      '1': 0,
    };

    for (const entity of this.entities.values()) {
      if (entity.team != null) {
        result[entity.team] += 1;
      }
    }

    return result;
  }

  renderMap(context, images, selectionState, gridSize = 1, gridWidth = 1) {
    context.fillStyle = 'black';
    context.fillRect(-50, -50, this.width * 50 + 50, this.height * 50 + 50);

    context.fillStyle = 'antiquewhite';
    context.fillRect(-25, -25, this.width * 50, this.height * 50);

    for (let x = 0; x < this.width; x += gridSize) {
      for (let y = 0; y < this.height; y += gridSize) {
        context.strokeStyle = 'lightgray';
        context.lineWidth = gridWidth;
        context.strokeRect((x - 0.5) * 50, (y - 0.5) * 50, gridSize * 50, gridSize * 50);
      }
    }

    context.lineWidth = 1.0;

    for (const entity of this.entities.values()) {
      const isSelected = selectionState.map.indexOf(entity.id) !== -1;

      const type = Types[entity.type];
      if (type.render != null) {
        type.render(entity, this, context, images, isSelected);
      }
    }

    for (const entity of this.entities.values()) {
      const isSelected = selectionState.map.indexOf(entity.id) !== -1;

      const type = Types[entity.type];
      if (type.renderOverlay != null) {
        type.renderOverlay(entity, this, context, images, isSelected);
      }
    }
  }

  /**
   * Get an item on the map at a given x y position.
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
          let flag = true;
          for (const entity of this.entities.values()) {
            if (entity.x === x && entity.y === y) {
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
      const type = Types[entity.type];
      if (type == null) { console.log(entity.type); }
      if (type.processUpdate != null) {
        type.processUpdate(entity, this);
      }
    }
  }
}

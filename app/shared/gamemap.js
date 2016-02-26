import * as Ships from './ship';
import * as Mines from './mine';
import * as Shipyards from './shipyard';
import * as Hardpoints from './hardpoint';
import * as Islands from './island';
import Types from './types';
import MiniView from './miniview';

export const MAP_WIDTH = 20;
export const MAP_HEIGHT = 20;

const SCALE = 3;

/**
 * A map of the game containing islands and all current ships.
 */
export default class GameMap {

  constructor(mapNum) {
    this.miniview = new MiniView('miniview');

    this.team = null;

    this.initialSetup(mapNum);

    this.width = MAP_WIDTH;
    this.height = MAP_HEIGHT;
  }

  initialSetup(mapNum) {
    this.entities = new Map();
    this.nextEntityId = 2;

    this.entities.set('0', {
      id: '0',
      type: 'playerstate',
      coins: 50,
      targetMode: 'hull',
      numItems: 0,
    });

    this.entities.set('1', {
      id: '1',
      type: 'playerstate',
      coins: 50,
      targetMode: 'hull',
      numItems: 0,
    });

    this.template = {
      hull: 'gunboat',
      hardpoints: [],
    };

    switch (mapNum) {
      case 0:
        this.setupMapZero();
        break;
      case 1:
        this.setupMapOne();
        break;
      case 2:
        this.setupMapTwo();
        break;
      default:
        this.setupMapZero();
        break;
    }
  }

  setupMapZero() {
    Ships.createShipAndHardpoints(this, 0, 3, this.template, '0');
    Ships.createShipAndHardpoints(this, 17, 17, this.template, '1');

    const island1coordinates = [
      [1, 1],
      [1, 2],
    ];
    Islands.createIsland(this, island1coordinates);
    const island2coordinates = [
      [18, 17],
      [18, 18],
    ];
    Islands.createIsland(this, island2coordinates);

    const island3coordinates = [
      [17, 3],
    ];
    const island4coordinates = [
      [3, 17],
    ];
    Islands.createIsland(this, island3coordinates);
    Islands.createIsland(this, island4coordinates);
  }

  setupMapOne() {
    Ships.createShipAndHardpoints(this, 0, 3, this.template, '0');
    Ships.createShipAndHardpoints(this, 16, 17, this.template, '1');

    const island1coordinates = [
      [1, 1],
      [1, 2],
      [2, 1],
      [2, 2],
    ];
    Islands.createIsland(this, island1coordinates);

    const island2coordinates = [
      [17, 17],
      [17, 18],
      [18, 17],
      [18, 18],
    ];
    Islands.createIsland(this, island2coordinates);

    const island3coordinates = [
      [17, 3],
    ];
    const island4coordinates = [
      [3, 17],
    ];
    Islands.createIsland(this, island3coordinates);
    Islands.createIsland(this, island4coordinates);

    const island5coordinates = [
      [10, 10],
      [10, 11],
      [11, 10],
      [11, 11],
    ];
    Islands.createIsland(this, island5coordinates);
  }

  setupMapTwo() {
    Ships.createShipAndHardpoints(this, 0, 3, this.template, '0');
    Ships.createShipAndHardpoints(this, 16, 17, this.template, '1');

    const island1coordinates = [
      [1, 1],
      [1, 2],
      [2, 1],
      [2, 2],
    ];
    Islands.createIsland(this, island1coordinates);

    const island2coordinates = [
      [17, 17],
      [17, 18],
      [18, 17],
      [18, 18],
    ];
    Islands.createIsland(this, island2coordinates);

    const island3coordinates = [
      [17, 3],
    ];
    const island4coordinates = [
      [3, 17],
    ];
    Islands.createIsland(this, island3coordinates);
    Islands.createIsland(this, island4coordinates);

    const island5coordinates = [
      [9, 9],
      [9, 10],
      [10, 9],
      [10, 10],
    ];
    Islands.createIsland(this, island5coordinates);

    const island6coordinates = [
      [5, 5],
    ];
    const island7coordinates = [
      [13, 13],
    ];
    Islands.createIsland(this, island6coordinates);
    Islands.createIsland(this, island7coordinates);
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
      return this.renderMap(context, images, selectionState);
    } else {
      return this.renderMap(context, images, selectionState);
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

    let player0 = this.getEntity('0');
    let player1 = this.getEntity('1');
    player0.numItems = 0;
    player1.numItems = 0;

    for (const entity of this.entities.values()) {
      if (entity.team === '0') {
        player0.numItems += 1;
      } else if (entity.team === '1') {
        player1.numItems += 1;
      }

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

    context.fillStyle = 'black';
    context.textBaseline = 'top';
    context.font = '50px sans-serif';
    context.fillText("Mini Map", -25, -100);
    if (player0.numItems == 0) {
      return 'end';
    } else if (player1.numItems == 0) {
      return 'end';
    }
    return 'game';
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

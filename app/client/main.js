import GameMap from '../shared/gamemap';
import Gui from '../shared/gui';
import ShipbuilderGui from '../shared/shipbuildergui';
import loadImages from './images';
import Ship from '../shared/ship';
import Shipyard from '../shared/shipyard';

import { defaultTemplate } from '../shared/template';

const MILLISECONDS_PER_LOGIC_UPDATE = 5;
const MILLISECONDS_PER_RENDER_UPDATE = 15;

const SHIPBUILDMODE = true;
const SCALE = 4;


const templates = [defaultTemplate(), defaultTemplate(), defaultTemplate()];

/**
 * The central game object for most of the logic.
 */
class Main {
  /**
   * Contruct the game.
   * Takes as input the images object as produced by images.js
   */
  constructor(images) {
    this.mode = 'game';

    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    this.canvas.width = 1200;
    this.canvas.height = 500;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.images = images;

    this.templates = [];

    this.game = new Game(images);
    this.shipbuilder = new Shipbuilder(images);

    this.pressedKeys = new Set();

    this.actionMap = {
      37: () => this.game.x -= 1,
      38: () => this.game.y -= 1,
      39: () => this.game.x += 1,
      40: () => this.game.y += 1,
    };

    document.addEventListener('keydown', (event) => {
      this.game.keydown(event, this.pressedKeys);
    });

    document.addEventListener('keyup', (event) => {
      this.game.keyup(event, this.pressedKeys);
    });

    // Ignore right click events on the canvas
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    this.canvas.addEventListener('mousedown', (event) => {
      if (this.mode === 'game') {
        this.mode = this.game.mousedown(event, this.sendMessage.bind(this));
      } else if (this.mode === 'shipbuilder') {
        this.mode = this.shipbuilder.mousedown(event);
      }
    });

    this.canvas.addEventListener('mouseup', (event) => {
      if (this.mode === 'game') {
        // Nothing for now
      } else if (this.mode === 'shipbuilder') {
        this.shipbuilder.mouseup(event);
      }
    });

    this.canvas.addEventListener('mousemove', (event) => {
      if (this.mode === 'game') {
        this.game.mousemove(event);
      } else if (this.mode === 'shipbuilder') {
        this.shipbuilder.mousemove(event);
      }
    });

    this.messageHandlerMap = {
      'SetShipPosition': this.game._setShipPositionHandler.bind(this.game),
      'SetPosition': this.game._setPositionHandler.bind(this.game),
      'SetResources': this.game._setResourcesHandler.bind(this.game),
      'UpdateTimeLeftToBuild': this.game._updateTimeLeftToBuildHandler.bind(this.game),
      'DealDamage': this.game._dealDamageHandler.bind(this.game),
      'StartShowingAttack': this.game._startShowingAttack.bind(this.game),
      'StopShowingAttack': this.game._stopShowingAttack.bind(this.game),
      'AddProjectile': this.game._addProjectile.bind(this.game),
      'SetProjectilePosition': this.game._setProjectilePosition.bind(this.game),
      'RemoveProjectile': this.game._removeProjectile.bind(this.game),
    };
  }

  sendMessage(message) {
    console.log('Sending', message);
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Start the game by setting up the render intervals.
   */
  start() {
    this.ws = new WebSocket('ws://localhost:3000');
    this.ws.onmessage = this._onMessage.bind(this);

    setInterval(this.render.bind(this), MILLISECONDS_PER_RENDER_UPDATE);
    this.lastUpdate = performance.now();

    this.start = performance.now();
  }

  _onMessage(event) {
    const messageData = JSON.parse(event.data);
    if (messageData.type in this.messageHandlerMap) {
      this.messageHandlerMap[messageData.type](messageData);
    } else {
      console.error('Unknown type: ', messageData.type);
    }
    console.log('Got' + event.data);
  }

  /**
   * Update the game state when necessary.
   */
  update(currentTime) {
    while (currentTime > this.lastUpdate) {
      this.tick();
      this.lastUpdate += MILLISECONDS_PER_LOGIC_UPDATE;
    }
  }

  /**
   * Perform a discrete update of the logic.
   */
  tick() {
    for (const key in this.actionMap) {
      if (this.pressedKeys.has(+key)) {
        this.actionMap[key]();
      }
    }
  }

  /**
   * Render the game. Also performs updates if necessary.
   */
  render() {
    const time = performance.now();

    this.update(time);

    if (this.mode === 'game') {
      this.game.render();
    } else if (this.mode === 'shipbuilder') {
      this.shipbuilder.render();
    }
  }
}

class Game {
  /**
   * Contruct the game.
   * Takes as input the images object as produced by images.js
   */
  constructor(images) {
    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.selectionState = {
      gui: null,
      map: null,
    };

    this.projectiles = new Map();

    this.images = images;
    this.map = new GameMap();
    this.miniMap = this.map;
    this.gui = new Gui(this.width, this.height, templates, this.selectionState);

    this.x = 0;
    this.y = 0;
  }

  updateSelectionState(newState) {
    if (this.selectionState.gui != null) {
      this.selectionState.gui.isSelected = false;
    }
    if (this.selectionState.map != null) {
      this.selectionState.map.isSelected = false;
    }

    this.selectionState = newState;

    this.gui.setSelectionState(this.selectionState);

    if (this.selectionState.gui != null) {
      this.selectionState.gui.isSelected = true;
    }

    if (this.selectionState.map != null) {
      this.selectionState.map.isSelected = true;
    }
  }

  mousedown(event, sendMessage) {
    if (event.button === 0) {
      // Select/Deselect on left click or do button thingy

      const { rawX, rawY } = this.getRawMouseCords(event);

      if (rawX > this.width - (8 * 50)) {
        return this.processGuiLeftMouseClick(rawX, rawY);
      }

      this.processMapLeftMouseClick(rawX, rawY, sendMessage);
    } else if (event.button === 2) {
      // Go do stuff on right click,  like move or whatnot

      if (this.selectionState.gui != null) {
        // Stop gui action with right click
        this.updateSelectionState({ ...this.selectionState, gui: null });
        return 'game';
      }

      // Otherwise let's move! (or attack)

      const { rawX, rawY } = this.getRawMouseCords(event);

      if (rawX > this.width - (8 * 50)) {
        // Ignore right clicks on the gui
        return 'game';
      }

      if (this.selectionState.map != null) {
        this.processRightClickOnMap(rawX, rawY, sendMessage);
      }
    }

    return 'game';
  }

  processRightClickOnMap(rawX, rawY, sendMessage) {
    const x = rawX + this.x - 25;
    const y = rawY + this.y - 25;

    // The mouse coordinates in grid coordinatess.
    let mouseX = x / (50);
    let mouseY = y / (50);
    if (this.map.getMode() === 'tactical') {
      mouseX = (x + 50 * SCALE) / (50 * SCALE);
      mouseY = (y + 50 * SCALE) / (50 * SCALE);
    }

    console.log('foo');
    const item = this.map.getItem(mouseX, mouseY);

    if (item == null) {
      if (this.selectionState.map instanceof Ship) {
        // Try to move to that location.
        const targetLocation = { x: mouseX, y: mouseY };
        // Move to an empty place
        sendMessage({ type: 'MoveShip', shipId: this.selectionState.map.getId(), targetLocation });
      }
    } else {
      if (item instanceof Ship && this.selectionState.map instanceof Ship) {
        // Trying to attack a ship
        sendMessage({ type: 'AttackShip', id: this.selectionState.map.getId(), targetId: item.getId() });
      }
    }
  }

  mousemove(event) {
    const { rawX, rawY } = this.getRawMouseCords(event);
    this.hoveredCoords = { x: rawX, y: rawY };
  }

  getRawMouseCords(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      rawX: event.clientX - rect.left,
      rawY: event.clientY - rect.top,
    };
  }

  processGuiLeftMouseClick(rawX, rawY) {
    // In the gui
    var item = this.gui.getItem(Math.floor(rawX / 50), Math.floor(rawY / 50));
    var olditem = this.selectedItem;
    if (item != null) {
      if (item.getType() === 'shipbuilder') {
        return 'shipbuilder';
      }
      this.updateSelectionState({ ...this.selectionState, gui: item });

      if (item.getType() === 'strategic') {
        if (olditem instanceof Ship) {
          this.x = olditem.getX()*50*SCALE - this.width/2 + 200;
          this.y = olditem.getY()*50*SCALE - this.height/2;
          console.log(this.x, this.y)
        } else {
          this.x += this.width/2;
          this.y += this.height/2
        }
        this.map.setMode('tactical');
        item.setType('tactical');
        this.updateSelectionState({ ...this.selectionState, gui: null });        
      } else if (item.getType() === 'tactical') {
        this.x = 0;
        this.y = 0;
        this.map.setMode('strategic');
        item.setType('strategic');
        this.updateSelectionState({ ...this.selectionState, gui: null });        
      }
    }

    if (this.map.mode == 'tactical') {
      // Minimap selection logic
      var view = this.miniMap.setView(rawX, rawY);
      if (view != null) {
        this.x = view.x;
        this.y = view.y;
      }
    }

    return 'game';
  }

  processMapLeftMouseClick(rawX, rawY, sendMessage) {
    const x = rawX + this.x - 25;
    const y = rawY + this.y - 25;

    // The mouse coordinates in grid coordinatess.
    let mouseX = x / (50);
    let mouseY = y / (50);
    if (this.map.getMode() === 'tactical') {
      mouseX = (x + 50 * SCALE) / (50 * SCALE) - 1;
      mouseY = (y + 50 * SCALE) / (50 * SCALE) - 1;
      console.log(mouseX, mouseY);
    }

    const mouseRoundedX = Math.round(mouseX);
    const mouseRoundedY = Math.round(mouseY);

    const item = this.map.getItem(mouseX, mouseY);

    if (this.selectionState.gui != null) {
      // The gui stuff always has priority.

      // If an empty tile on an island is selected then add a building
      if (this.selectionState.gui.getType() === 'shiptemplate') {
        const template = templates[this.selectionState.gui.getTemplateNum()];
        sendMessage({ type: 'MakeShip', islandID: this.selectionState.map.getIslandID(), x: mouseRoundedX, y: mouseRoundedY, template });
      } else if (this.selectionState.gui.getType() === 'mine' || this.selectionState.gui.getType() === 'shipyard') {
        const buildingType = this.selectionState.gui.getType();
        sendMessage({ type: 'MakeBuilding', building: buildingType, x: mouseRoundedX, y: mouseRoundedY });
      } else if (this.selectionState.gui.getType() === 'roundshot' && item instanceof Ship) {
        sendMessage({ type: 'FireShot', id: this.selectionState.map.getId(), hardpointId: this.selectionState.gui.getTemplateNum(), targetId: item.getId() });
      }
    } else if (item != null) {
      // Select
      this.updateSelectionState({ ...this.selectionState, map: item });
    } else {
      // Deselect
      this.updateSelectionState({ ...this.selectionState, map: null });
    }
  }

  _removeProjectile({ id }) {
    this.projectiles.delete(id);
  }

  _addProjectile({ id, position }) {
    this.projectiles.set(id, position);
  }

  _setProjectilePosition({ id, position }) {
    this.projectiles.set(id, position);
  }

  _startShowingAttack({ id, targetId }) {
    this.map.getShip(id).showAttack(targetId);
  }

  _stopShowingAttack({ id }) {
    this.map.getShip(id).stopShowAttack();
  }

  _setShipPositionHandler(setShipPositionMessage) {
    const { shipId, position } = setShipPositionMessage;
    this.map.getShip(shipId).setPosition(position.x, position.y);
  }

  _setPositionHandler(setPositionMessage) {
    const { object, position, islandID, template } = setPositionMessage;
    this.map.addBuilding(object, position.x, position.y, islandID, template);
  }

  _setResourcesHandler({ coin }) {
    this.map.setCoins(coin);
  }

  _updateTimeLeftToBuildHandler({ id, timeLeftToBuild, object }) {
    this.map.getBuilding(id, object).timeLeftToBuild = timeLeftToBuild;
  }

  _dealDamageHandler({ enemyShipId, damage }) {
    this.map.getShip(enemyShipId).dealDamage(damage);

    if (this.map.getShip(enemyShipId).getHealth() <= 0) {
      this.map.removeShip(enemyShipId);
    }
  }

  /**
   * Render the game. Also performs updates if necessary.
   */
  render() {
    this.context.clearRect(0, 0, this.width, this.height);

    this.context.save();

    this.context.translate(25, 25);

    this.context.translate(-this.x, -this.y);

    // Render the map and everything on it.
    this.map.render(this.context, this.images);

    for (const position of this.projectiles.values()) {
      const radius = 10;
      this.context.drawImage(this.images.roundshot, position.x * 50 - radius / 2, position.y * 50 - radius / 2, radius, radius);
    }

    this.context.restore();

    if (this.hoveredCoords && this.hoveredCoords.x >= 400) {
      this.gui.render(this.context, this.images, this.map, this.hoveredCoords);
    } else {
      this.gui.render(this.context, this.images, this.map, null);
    }

    this.context.translate(this.width - 175, 25);
    this.context.scale(0.25, 0.25);
    this.miniMap.renderMiniMap(this.context, this.images, this.x, this.y, this.width, this.height);
    this.context.scale(4, 4);
    this.context.translate(-this.width + 175, -25);
  }

  keydown(event, pressedKeys) {
    pressedKeys.add(event.keyCode);
  }

  keyup(event, pressedKeys) {
    pressedKeys.delete(event.keyCode);
  }
}

class Shipbuilder {
  /**
   * Contruct the shipbuilder menu
   */
  constructor(images) {
    this.images = images;
    this.shipbuildergui = new ShipbuilderGui(templates);

    this.canvas = document.getElementById('canvas');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.context = this.canvas.getContext('2d');

    this.x = 0;
    this.y = 0;
  }

  mousedown(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left + this.x - 25;
    const mouseY = event.clientY - rect.top + this.y - 25;

    if (event.button === 2) {
      // Deselect on right click
      this.shipbuildergui.deselect();
      this.shipbuildergui.emptyslot(mouseX, mouseY);
    } else if (event.button === 0) {
      return this.shipbuildergui.select(mouseX, mouseY);
    }
    return 'shipbuilder';
  }

  mouseup(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left + this.x - 25;
    const mouseY = event.clientY - rect.top + this.y - 25;

    this.shipbuildergui.releaseItem(mouseX, mouseY);
  }

  mousemove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left + this.x - 25;
    const mouseY = event.clientY - rect.top + this.y - 25;

    this.shipbuildergui.updatePos(mouseX, mouseY);
  }

  /**
   * Render the game. Also performs updates if necessary.
   */
  render() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.save();

    this.context.translate(25, 25);

    this.context.translate(-this.x, -this.y);

    // Render the gui
    this.shipbuildergui.render(this.context, this.images);

    this.context.restore();
  }
}

document.addEventListener('DOMContentLoaded', function startCanvas() {
  loadImages().then((images) => {
    const main = new Main(images);
    main.start();
  });
});

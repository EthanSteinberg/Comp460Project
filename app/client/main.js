import GameMap from '../shared/gamemap';
import Gui from '../shared/gui';
import ShipbuilderGui from '../shared/shipbuildergui';

import loadImages from './images';
import Ship from '../shared/ship';
import Shipyard from '../shared/shipyard';

const MILLISECONDS_PER_LOGIC_UPDATE = 5;
const MILLISECONDS_PER_RENDER_UPDATE = 15;

const SHIPBUILDMODE = true;

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

    this.images = images;
    this.game = new Game(images);
    this.shipbuilder = new Shipbuilder(images);

    this.canvas = document.getElementById('canvas');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.context = this.canvas.getContext('2d');

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
      if (this.mode == 'game') {
        this.mode = this.game.mousedown(event, this.sendMessage.bind(this), this.shipbuilder.getStats());
      } else if (this.mode == 'shipbuilder') {
        this.mode = this.shipbuilder.mousedown(event);
      }
    });

    this.messageHandlerMap = {
      'SetShipPosition': this._setShipPositionHandler.bind(this),
      'SetPosition': this._setPositionHandler.bind(this),
    };
  }

  _setShipPositionHandler(setShipPositionMessage) {
    this.game._setShipPositionHandler(setShipPositionMessage);
  }

  _setPositionHandler(setPositionMessage) {
    this.game._setPositionHandler(setPositionMessage);
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

    if (this.mode == 'game') {
      this.game.render();
    } else if (this.mode == 'shipbuilder') {
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
    this.images = images;
    this.map = new GameMap();
    this.gui = new Gui();

    this.x = 0;
    this.y = 0;

    this.canvas = document.getElementById('canvas');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.context = this.canvas.getContext('2d');
  }

  mousedown(event, sendMessage, stats) {
    if (event.button === 2) {
      // Deselect on right click
      if (this.selectedItem instanceof Shipyard) {
        this.gui.removeShipyardDisplay();
      }
      this.setSelectedItem(null);
    } else if (event.button === 0) {
      const rect = this.canvas.getBoundingClientRect();
      const rawX = event.clientX - rect.left;
      const rawY = event.clientY - rect.top;

      if (rawX > 400) {
        return this.processGuiMouseClick(rawX, rawY);
      } else {
        this.processMapMouseClick(rawX, rawY, sendMessage, stats);
      }
    }

    return 'game';
  }

  processGuiMouseClick(rawX, rawY) {
    // In the gui
    const item = this.gui.getItem(Math.floor(rawX / 50), Math.floor(rawY / 50));
    if (item != null) {
      if (item.getType() == 'shipbuilder') {
        return 'shipbuilder';
      }
      this.guiSelected = true;
      this.setSelectedItem(item);
    }

    return 'game';
  }

  processMapMouseClick(rawX, rawY, sendMessage, stats) {
    const x = rawX + this.x - 25;
    const y = rawY + this.y - 25;

    // The mouse coordinates in grid coordinatess.
    const mouseX = x / 50;
    const mouseY = y / 50;

    const mouseRoundedX = Math.round(mouseX);
    const mouseRoundedY = Math.round(mouseY);

    const item = this.map.getItem(mouseX, mouseY);

    if (this.selectedItem != null) {
      // Something is currently selected. Try to move if empty. Otherwise select.
      if (item == null) {
        if (this.guiSelected) {
          // If an empty tile on an island is selected then add a building
          if (this.selectedItem.getType() == 'shiptemplate') {
            sendMessage({ type: 'MakeShip', islandID: this.selectedShipyard.getIslandID(), x: mouseRoundedX, y: mouseRoundedY, shipstats: stats });
            this.gui.removeShipyardDisplay();
          } else {
            var buildingType = this.selectedItem.getType();
            sendMessage({ type: 'MakeBuilding', building: buildingType, x: mouseRoundedX, y: mouseRoundedY });
          }      
          this.guiSelected = false;
          this.setSelectedItem(item); 
        } else if (this.selectedItem instanceof Ship) {
          // Try to move to that location.
          const targetLocation = { x: mouseX, y: mouseY };
          sendMessage({ type: 'MoveShip', shipId: this.selectedItem.getId(), targetLocation });
        } 
      } else {
        // TODO: Add logic for attacking stuff.
        if (this.selectedItem instanceof Shipyard && this.guiSelected == false) {
          this.gui.removeShipyardDisplay();
        }
        
      }
    } else {
      // Simply select the thing that was pressed.
     if (this.selectedItem instanceof Shipyard && this.guiSelected == false) {
        this.gui.removeShipyardDisplay();
      }
      this.setSelectedItem(item);
      // TODO: Add logic for detecting if it is an enemy thingy.
    }

    if (this.selectedItem instanceof Shipyard) {
      this.gui.displayShipyard(stats);
      this.selectedShipyard = this.selectedItem;
    }
       
  }

  setSelectedItem(item) {
    if (this.selectedItem != null) {
      if (this.selectedItem.getType() == 'ship') {
        this.gui.removeShipStats();
      }
      this.selectedItem.isSelected = false;
    }

    this.selectedItem = item;

    if (item != null) {
      item.isSelected = true;
      if (item.getType() == 'ship') {
        this.gui.displayShipStats(item.getStats());
      }
    }
  }

  _setShipPositionHandler(setShipPositionMessage) {
    const { shipId, position } = setShipPositionMessage;
    this.map.getShip(shipId).setPosition(position.x, position.y);
  }

  _setPositionHandler(setPositionMessage) {
    const { object, position, islandID, stats } = setPositionMessage;
    this.map.addBuilding(object, position.x, position.y, islandID, stats);
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

    this.context.restore();
     // Render the gui
    this.gui.render(this.context, this.images);
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
    this.shipbuildergui = new ShipbuilderGui();

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

  getStats() {
    return this.shipbuildergui.getStats();
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

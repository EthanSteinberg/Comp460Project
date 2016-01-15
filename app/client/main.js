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
class Game {
  /**
   * Contruct the game.
   * Takes as input the images object as produced by images.js
   */
  constructor(images) {
    this.images = images;
    this.map = new GameMap();
    this.gui = new Gui();

    this.canvas = document.getElementById('canvas');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.context = this.canvas.getContext('2d');

    // Ignore right click events on the canvas
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    this.canvas.addEventListener('mousedown', (event) => {
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
          this.processGuiMouseClick(rawX, rawY);
        } else {
          this.processMapMouseClick(rawX, rawY);
        }
      }
    });

    this.pressedKeys = new Set();

    this.x = 0;
    this.y = 0;

    this.actionMap = {
      37: () => this.x -= 1,
      38: () => this.y -= 1,
      39: () => this.x += 1,
      40: () => this.y += 1,
    };

    this.messageHandlerMap = {
      'SetShipPosition': this._setShipPositionHandler.bind(this),
      'SetPosition': this._setPositionHandler.bind(this),
    };
  }

  processGuiMouseClick(rawX, rawY) {
    // In the gui
    const item = this.gui.getItem(Math.floor(rawX / 50), Math.floor(rawY / 50));
    if (item != null) {
      this.guiSelected = true;
      this.setSelectedItem(item);
    }
  }

  processMapMouseClick(rawX, rawY) {
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
            this.sendMessage({ type: 'MakeShip', islandID: this.selectedShipyard.getIslandID(), x: mouseRoundedX, y: mouseRoundedY });
            this.gui.removeShipyardDisplay();
          } else {
            var buildingType = this.selectedItem.getType();
            this.sendMessage({ type: 'MakeBuilding', building: buildingType, x: mouseRoundedX, y: mouseRoundedY });
          }      
          this.guiSelected = false;
          this.setSelectedItem(item); 
        } else if (this.selectedItem instanceof Ship) {
          // Try to move to that location.
          const targetLocation = { x: mouseX, y: mouseY };
          this.sendMessage({ type: 'MoveShip', shipId: this.selectedItem.getId(), targetLocation });
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
        this.gui.displayShipyard();
        this.selectedShipyard = this.selectedItem;
    }
       
  }

  setSelectedItem(item) {
    if (this.selectedItem != null) {
      this.selectedItem.isSelected = false;
    }

    this.selectedItem = item;

    if (item != null) {
      item.isSelected = true;
    }
  }

  _setShipPositionHandler(setShipPositionMessage) {
    const { shipId, position } = setShipPositionMessage;
    this.map.getShip(shipId).setPosition(position.x, position.y);
  }

  _setPositionHandler(setPositionMessage) {
    const { object, position, islandID } = setPositionMessage;
    this.map.addBuilding(object, position.x, position.y, islandID);
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

    this.frames = 0;
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

    this.frames += 1;

    this.update(time);

    this.context.clearRect(0, 0, this.width, this.height);

    this.context.save();

    this.context.translate(25, 25);

    this.context.translate(-this.x, -this.y);

    // Render the map and everything on it.
    this.map.render(this.context, this.images);

    this.context.restore();
     // Render the gui
    this.gui.render(this.context, this.images);

    this.context.font = '50px sans-serif';
    this.context.fillStyle = 'black';
    this.context.fillText('FPS: ' + this.frames / (time - this.start) * 1000, 0, 400);

    if (this.frames === 100) {
      this.start = time;
      this.frames = 0;
    }
  }

  keydown(event) {
    this.pressedKeys.add(event.keyCode);
  }

  keyup(event) {
    this.pressedKeys.delete(event.keyCode);
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

    // Ignore right click events on the canvas
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    this.canvas.addEventListener('mousedown', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left + this.x - 25;
      const mouseY = event.clientY - rect.top + this.y - 25;

      if (event.button === 2) {
        // Deselect on right click
        this.shipbuildergui.deselect();
        this.shipbuildergui.emptyslot(mouseX, mouseY);
      } else if (event.button === 0) {
        this.shipbuildergui.select(mouseX, mouseY);
      }
    });

    this.pressedKeys = new Set();

    this.x = 0;
    this.y = 0;

    this.actionMap = {
      37: () => this.x -= 1,
      38: () => this.y -= 1,
      39: () => this.x += 1,
      40: () => this.y += 1,
    };
  }

  /**
   * Start the game by setting up the render intervals.
   */
  start() {
    // this.ws = new WebSocket('ws://localhost:3000');
    // this.ws.onmessage = this._onMessage.bind(this);

    setInterval(this.render.bind(this), MILLISECONDS_PER_RENDER_UPDATE);
    this.lastUpdate = performance.now();

    this.frames = 0;
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

    this.frames += 1;

    this.update(time);

    this.context.clearRect(0, 0, this.width, this.height);
    this.context.save();

    this.context.translate(25, 25);

    this.context.translate(-this.x, -this.y);

    // Render the gui
    this.shipbuildergui.render(this.context, this.images);

    this.context.restore();

    if (this.frames === 100) {
      this.start = time;
      this.frames = 0;
    }
  }
}

document.addEventListener('DOMContentLoaded', function startCanvas() {
  loadImages().then((images) => {
    const game = new Game(images);

    document.addEventListener('keydown', (event) => {
      game.keydown(event);
    });

    document.addEventListener('keyup', (event) => {
      game.keyup(event);
    });

    // game.start();

    const shipbuilder = new Shipbuilder(images);
    shipbuilder.start();
  });
});

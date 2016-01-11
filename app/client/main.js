import GameMap from '../shared/gamemap';
import Gui from '../shared/gui';
import loadImages from './images';
import Ship from '../shared/ship';


const MILLISECONDS_PER_LOGIC_UPDATE = 5;
const MILLISECONDS_PER_RENDER_UPDATE = 15;

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
        this.selectedItem = null;
      } else if (event.button === 0) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left + this.x;
        const y = event.clientY - rect.top + this.y;

        // The mouse coordinates in grid coordinatess.
        const mouseRoundedX = Math.floor(x / 50);
        const mouseRoundedY = Math.floor(y / 50);

        var item = this.map.getItem(mouseRoundedX, mouseRoundedY);
        // Check if we have clicked an item in the gui
        if (item == null) {
          item = this.gui.getItem(mouseRoundedX, mouseRoundedY);
          if (item != null) {
            this.guiSelected = true;
          }
        }
        
        if (this.selectedItem != null) {
          // Something is currently selected. Try to move if empty. Otherwise select.
          if (item == null) {
            if (this.guiSelected) {
              // If an empty tile on an island is selected then add a building
              var buildingType = this.selectedItem.getBuilding();
              this.sendMessage({ type: 'MakeBuilding', building: buildingType, x: mouseRoundedX, y: mouseRoundedY });
              this.guiSelected = false;
              this.selectedItem = null;          
            } else if (this.selectedItem instanceof Ship) {
              // Try to move to that location.
              const targetLocation = { x: mouseRoundedX, y: mouseRoundedY };
              this.sendMessage({ type: 'MoveShip', shipId: this.selectedItem.getId(), targetLocation });
            }
          } else {
            // TODO: Add logic for attacking stuff.
            this.selectedItem = item;
          }
        } else {
          // Simply select the thing that was pressed.
          this.selectedItem = item;
          // TODO: Add logic for detecting if it is an enemy thingy.
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
      'SetBuildingPosition': this._setBuildingPositionHandler.bind(this),
    };
  }

  _setShipPositionHandler(setShipPositionMessage) {
    const { shipId, position } = setShipPositionMessage;
    this.map.getShip(shipId).setPosition(position.x, position.y);
  }

  _setBuildingPositionHandler(setBuildingPositionMessage) {
    const { building, position } = setBuildingPositionMessage;
    this.map.addBuilding(building, position.x, position.y);
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

    this.context.translate(-this.x, -this.y);

    // Render the map and everything on it.
    this.map.render(this.context, this.images);
    // Render the gui
    this.gui.render(this.context, this.images);

    if (this.selectedItem != null) {
      this.context.strokeStyle = 'cyan';
      this.context.strokeRect(
        this.selectedItem.getX() * 50,
        this.selectedItem.getY() * 50,
        50,
        50
      );
    }

    this.context.restore();
    this.context.font = '50px sans-serif';
    this.context.fillStyle = 'black';
    this.context.fillText('FPS: ' + this.frames / (time - this.start) * 1000, 100, 500);

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

document.addEventListener('DOMContentLoaded', function startCanvas() {
  loadImages().then((images) => {
    const game = new Game(images);

    document.addEventListener('keydown', (event) => {
      game.keydown(event);
    });

    document.addEventListener('keyup', (event) => {
      game.keyup(event);
    });

    game.start();
  });
});

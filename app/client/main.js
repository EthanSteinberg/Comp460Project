import Map from '../shared/map';
import loadImages from './images';
import astar from '../shared/astar';

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
    this.map = new Map();

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

        const item = this.map.getItem(mouseRoundedX, mouseRoundedY);

        if (this.selectedItem != null) {
          // Something is currently selected. Try to move if empty. Otherwise select.
          if (item == null) {
            // Try to move to that location.

            const startPosition = { x: this.selectedItem.getX(), y: this.selectedItem.getY() };
            const goalPosition = { x: mouseRoundedX, y: mouseRoundedY };

            const isEmpty = ({ x: tempX, y: tempY }) => {
              return this.map.getItem(tempX, tempY) == null && !this.map.isIsland(tempX, tempY);
            };
            const isValid = ({ x: tempX, y: tempY }) => {
              return tempX >= 0 && tempX < this.map.width && tempY >= 0 && tempY < this.map.height;
            };
            const moves = astar(startPosition, goalPosition, isEmpty, isValid);
            if (moves == null) {
              console.log('no such path');
            } else {
              this.selectedItem.setMoves(moves);
            }
          } else {
             // TODO: Add logic for attacking stuff.
            this.selectedItem = item;
          }
        } else {
          // Simply select the thing that was pressed.
          // TODO: Add logic for detecting if it is an enemy thingy.
          this.selectedItem = item;
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
  }

  /**
   * Start the game by setting up the render intervals.
   */
  start() {
    setInterval(this.render.bind(this), MILLISECONDS_PER_RENDER_UPDATE);
    this.lastUpdate = performance.now();

    this.frames = 0;
    this.start = performance.now();
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
    this.map.tick();
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

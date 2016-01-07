/**
 * @flow
 */

import Map from '../shared/map';

class Game {
  constructor() {

    this.canvas = document.getElementById('canvas');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.context = this.canvas.getContext('2d');

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

  start() {
    setInterval(this.render.bind(this), 15);
    this.lastUpdate = performance.now();

    this.frames = 0;
    this.start = performance.now();
  }

  update(currentTime) {
    while (currentTime > this.lastUpdate) {
      this.tick();
      this.lastUpdate += 5;
    }
  }

  tick() {
    for (const key in this.actionMap) {
      if (this.pressedKeys.has(+key)) {
        this.actionMap[key]();
      }
    }
  }

  render() {
    const time = performance.now();

    this.frames+=1;

    this.update(time);

    const map = new Map();

    this.context.clearRect(0, 0, this.width, this.height);
    this.context.save()

    this.context.fillStyle = 'blue';
    this.context.translate(-this.x, -this.y);
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.font = '50px sans-serif';
    this.context.fillStyle = 'black';
    this.context.fillText('FPS: ' + this.frames/ (time - this.start) * 1000, 100, 100);
    map.render(this.context);

    this.context.restore();

    if (this.frames == 100) {
      console.log(this.frames/ (time - this.start) * 1000);
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
  const game = new Game();

  document.addEventListener('keydown', (event) => {
    game.keydown(event);
  }, false);

  document.addEventListener('keyup', (event) => {
    game.keyup(event);
  }, false);

  game.start();
});

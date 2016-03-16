import loadAssets from './assets';
import { createSource } from './audio';

const MILLISECONDS_PER_LOGIC_UPDATE = 5;
const MILLISECONDS_PER_RENDER_UPDATE = 15;

import Game from './game';
import StartScreen from './startscreen';
import EndScreen from './endscreen';
import GameMap from '../shared/gamemap';

import { createMap } from '../shared/maps';


/**
 * The central game object for most of the logic.
 */
class Main {
  /**
   * Contruct the game.
   * Takes as input the images object as produced by images.js
   */
  constructor(images) {
    this.mode = 'start';

    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    this.canvas.width = 1200;
    this.canvas.height = 500;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.images = images;

    this.game = new Game(this.images, createMap(0), "0");
    this.startscreen = new StartScreen(images, this.game);
    this.endscreen = null;

    document.addEventListener('keydown', (event) => {
      if (this.mode === 'game') {
        this.game.keydown(event, this.pressedKeys);
      }
    });

    document.addEventListener('keyup', (event) => {
      if (this.mode === 'game') {
        this.game.keyup(event, this.pressedKeys);
      }
    });

    // Ignore right click events on the canvas
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    this.canvas.addEventListener('mousedown', (event) => {
      if (this.mode === 'game') {
        this.game.mousedown(event, this.sendMessage.bind(this));
      } else if (this.mode === 'start') {
        this.startscreen.mousedown(event, this.sendMessage.bind(this));
      } else if (this.mode === 'end') {
        this.mode = this.endscreen.mousedown(event, this.sendMessage.bind(this));
      }
    });

    this.canvas.addEventListener('mouseup', (event) => {
      if (this.mode === 'game') {
        this.game.mouseup(event, this.sendMessage.bind(this));
      }
    });

    this.canvas.addEventListener('mousemove', (event) => {
      if (this.mode === 'game') {
        this.game.mousemove(event);
      } else if (this.mode === 'start') {
        this.startscreen.mousemove(event);
      }
    });

    this.messageHandlerMap = {
      'AddEntity': m => this.game._addEntity(m),
      'UpdateEntity': m => this.game._updateEntity(m),
      'RemoveEntity': m => this.game._removeEntity(m),
      'StartGame': m => this._startGame(m),
      'AssignTeam': m => this.startscreen._assignTeam(m),
      'UpdateReadyStates': m => this.startscreen._updateReadyStates(m),
      'UpdateMap': m => this._updateMap(m),
      'GameOver': m => this._gameOverHandler(m),
      'PlaySound': m => this._playSound(m),
      'MultiMessage': m => this._handleMulti(m),
    };

    this._startRenderLoop();
  }

  sendMessage(message) {
    // console.log('Sending', message);
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Start the game by setting up the render intervals.
   */
  start() {
    this.ws = new WebSocket('ws://localhost:3000');
    this.ws.onmessage = this._onMessage.bind(this);
  }

  _handleMulti({ messages }) {
    for (const message of messages) {
      this._handleMessage(message);
    }
  }

  _startRenderLoop() {
    setInterval(this.render.bind(this), MILLISECONDS_PER_RENDER_UPDATE);
    this.lastUpdate = performance.now();
  }

  _playSound({ soundId }) {
    if (!(soundId in this.images)) {
      console.error(soundId, ' not in this.images');
    }
    createSource(this.images[soundId]).start(0);
  }

  _startGame({ initialState, team }) {
    this.game = new Game(this.images, new GameMap(initialState), team);
    this.team = team;
    this.mode = 'game';
  }

  _gameOverHandler({ winningTeam }) {
    this.mode = 'end';
    this.game = null;
    this.endscreen = new EndScreen(this.images, winningTeam, this.team);
    this.startscreen = new StartScreen(this.images);
  }

  _updateMap({ mapNum }) {
    this.startscreen.selectMap(mapNum);
  }

  _onMessage(event) {
    const messageData = JSON.parse(event.data);
    this._handleMessage(messageData);
  }

  _handleMessage(messageData) {
    if (messageData.type in this.messageHandlerMap) {
      this.messageHandlerMap[messageData.type](messageData);
    } else {
      console.error('Unknown type: ', messageData.type);
    }
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
    if (this.mode === 'game') {
      this.game.tick();
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
    } else if (this.mode === 'start') {
      this.startscreen.render();
    } else if (this.mode === 'end') {
      this.endscreen.render();
    }
  }
}

document.addEventListener('DOMContentLoaded', function startCanvas() {
  loadAssets().then((images) => {
    const main = new Main(images);
    window.main = main;
    main.start();
  });
});

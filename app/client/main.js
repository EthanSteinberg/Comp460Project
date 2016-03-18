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
    this.context = this.canvas.getContext('webgl');

    this.canvas.width = 1200;
    this.canvas.height = 500;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.images = images;

    this.game = new Game(this.images, createMap(0), '0');
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
      this.render();
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

    this.setupGL();

    this._startRenderLoop();
  }

  setupGL() {
    const program = this.context.createProgram();

    const vertexSource = `
      attribute vec3 position;
      attribute vec2 a_texcoord;

      attribute vec2 a_texpos;
      attribute vec2 a_texsize;

      varying vec2 v_texcoord;

      varying vec2 v_texpos;
      varying vec2 v_texsize;

      uniform vec2 screen_size;

      void main()
      {
        v_texcoord = a_texcoord;
        v_texpos = a_texpos;
        v_texsize = a_texsize;
        vec2 temp = vec2(2, -2) * position.xy / screen_size + vec2(-1, 1);
        gl_Position = vec4(temp, position.z, 1.0);
      }
    `;

    const fragmentSource = `
      precision mediump float;
      uniform sampler2D testImage;

      uniform vec2 atlas_size;

      varying vec2 v_texcoord;

      varying vec2 v_texpos;
      varying vec2 v_texsize;

      void main()
      {
        gl_FragColor = texture2D(testImage, clamp(v_texcoord, v_texpos + vec2(0.5, 0.5), v_texpos + v_texsize - vec2(0.5, 0.5)) / atlas_size);
      }
    `;

    this.context.viewport(0, 0, this.width, this.height);

    const vertex = this.context.createShader(this.context.VERTEX_SHADER);
    this.context.shaderSource(vertex, vertexSource);
    this.context.compileShader(vertex);
    this.context.attachShader(program, vertex);

    const fragment = this.context.createShader(this.context.FRAGMENT_SHADER);
    this.context.shaderSource(fragment, fragmentSource);
    this.context.compileShader(fragment);
    this.context.attachShader(program, fragment);

    this.context.linkProgram(program);
    this.context.validateProgram(program);
    this.context.useProgram(program);

    this.program = program;

    this.texture = this.context.createTexture();

    this.context.activeTexture(this.context.TEXTURE0);
    this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, this.images.pixelPng);

    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);

    const validateStatus = this.context.getProgramParameter(program, this.context.VALIDATE_STATUS);
    if (validateStatus === false) {
      this.bad = true;
      console.log('vertex', this.context.getShaderInfoLog(vertex));
      console.log('fragment', this.context.getShaderInfoLog(fragment));
      console.log('program', this.context.getProgramInfoLog(program));
    } else {
      this.bad = false;

      const buffer = this.context.createBuffer();
      this.context.bindBuffer(this.context.ARRAY_BUFFER, buffer);

      const positionLocation = this.context.getAttribLocation(this.program, 'position');
      const texLocation = this.context.getAttribLocation(this.program, 'a_texcoord');
      const texPos = this.context.getAttribLocation(this.program, 'a_texpos');
      const texSize = this.context.getAttribLocation(this.program, 'a_texsize');

      this.context.enableVertexAttribArray(positionLocation);
      this.context.vertexAttribPointer(positionLocation, 3, this.context.FLOAT, false, 4 * 9, 0);

      this.context.enableVertexAttribArray(texLocation);
      this.context.vertexAttribPointer(texLocation, 2, this.context.FLOAT, false, 4 * 9, 4 * 3);

      this.context.enableVertexAttribArray(texPos);
      this.context.vertexAttribPointer(texPos, 2, this.context.FLOAT, false, 4 * 9, 4 * 5);

      this.context.enableVertexAttribArray(texSize);
      this.context.vertexAttribPointer(texSize, 2, this.context.FLOAT, false, 4 * 9, 4 * 7);

      const screenSizeLocation = this.context.getUniformLocation(this.program, 'screen_size');

      this.context.uniform2f(screenSizeLocation, this.width, this.height);

      const atlasSizeLocation = this.context.getUniformLocation(this.program, 'atlas_size');
      this.context.uniform2f(atlasSizeLocation, this.images.pixelJson.sizex, this.images.pixelJson.sizey);

      this.context.enable(this.context.BLEND);
      this.context.blendEquation(this.context.FUNC_ADD);

      this.context.blendFunc(this.context.ONE, this.context.ONE_MINUS_SRC_ALPHA);
    }
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
    if (this.bad) {
      return;
    }

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

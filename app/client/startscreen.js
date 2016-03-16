import MapSelect from '../shared/guibuttons/mapselect';
import Ready from '../shared/guibuttons/ready';
import { createMap } from '../shared/maps';
import { createSource } from './audio';

export const GUI_WIDTH = 200;


export default class StartScreen {
  constructor(images, game) {
    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    this.game = game;
    this.game.gui.displayMode = 'designer';
    this.game.gui.displayContext = 'startscreen';

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.images = images;
    this.team = null;

    this.buttons = [];
    this.buttons.push(new MapSelect('mapselect', 675, 325, 102, 26, 0));
    this.buttons.push(new MapSelect('mapselect', 825, 325, 102, 26, 1));
    this.buttons.push(new MapSelect('mapselect', 750, 375, 102, 26, 2));
    this.buttons[0].rendertype = 'westindies';
    this.buttons[1].rendertype = 'tropics';
    this.buttons[2].rendertype = 'greatlakes';

    this.buttons[0].selected = true;

    this.mode = 'splash';

    this.epicSound = createSource(images['bensound-epic']);
    this.epicSound.loop = true;
    this.epicSound.start(0);
  }

  render() {
    if (this.mode === 'splash') {
      this.renderSplash();
    } else if (this.mode === 'setup') {
      this.renderSetup();
    }
  }

  renderSplash() {
    this.context.drawImage(this.images.splashscreen, 0, 0);
  }

  renderSetup() {
    this.context.clearRect(0, 0, this.width, this.height);

    this.context.fillStyle = 'linen';
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.translate(this.width - 520, 50);
    const map = createMap(this.mapNum);
    const scale = map.width / 5;
    this.context.scale(1 / scale, 1 / scale);
    this.context.translate(25, 25);
    map.renderStartScreenMiniMap(this.context, this.images);
    this.context.translate(-25, -25);
    this.context.scale(scale, scale);
    this.context.translate(-this.width + 520, -50);

    for (const button of this.buttons) {
      button.render(this.context, this.images);
    }

    if (this.team == null) {
      this.renderLoading();
    } else {
      this.context.fillStyle = 'black';
      if (this.team === '1') {
        this.context.drawImage(this.images.piratesTag, 0, 0);
      } else if (this.team === '0') {
        this.context.drawImage(this.images.imperialsTag, 0, 0);
      }

      this.context.textBaseline = 'top';
      this.context.font = '50px Perpetua';
      this.context.fillText('Status:', 40, 250);

      this.context.font = '30px Perpetua';
      let startingY = 300;
      for (const team of Object.keys(this.readyStates)) {
        if (team != this.team) {
          this.context.fillText((team === '1' ? 'Pirates      ' : 'Imperials  ') + (this.readyStates[team] ? 'Ready' : 'Not Ready'), 50, startingY);
        } else {
          this.context.fillText((team === '1' ? 'Pirates      ' : 'Imperials  '), 50, startingY);
        }

        startingY += 50;
      }
    }

    if (this.hoveredCoords && this.hoveredCoords.x >= this.width - GUI_WIDTH) {
      this.game.gui.render(this.context, this.images, this.map, this.hoveredCoords);
    } else {
      this.game.gui.render(this.context, this.images, this.map, null);
    }
  }

  renderLoading() {
    this.context.font = '30px Brush Script MT';
    this.context.fillStyle = 'black';
    this.context.fillText('Loading ...', 50, 50);
  }

  _assignTeam({ team, readyStates, mapNum }) {
    this.team = team;
    this.game.team = team;
    this.mapNum = mapNum;
    this.readyStates = readyStates;

    if (this.team === '1') {
      this.buttons.push(new Ready('notready', 160, 355, 128, 26));
    } else {
      this.buttons.push(new Ready('notready', 160, 305, 128, 26));
    }
  }

  _updateReadyStates({ readyStates }) {
    this.readyStates = readyStates;
  }

  selectMap(mapNum) {
    for (const button of this.buttons) {
      if (button.getSlotNum() === mapNum) {
        button.selected = true;
      } else {
        button.selected = false;
      }
    }

    this.mapNum = mapNum;
  }

  getTeam() {
    return this.team;
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

  mousedown(event, sendMessage) {
    if (this.mode === 'splash') {
      this.mousedownSplash(event, sendMessage);
    } else if (this.mode === 'setup') {
      this.mousedownSetup(event, sendMessage);
    }
  }

  mousedownSplash() {
    this.epicSound.stop(0);
    this.mode = 'setup';
  }

  mousedownSetup(event, sendMessage) {
    if (this.team == null) {
      return;
    }

    const { rawX, rawY } = this.getRawMouseCords(event);

    const item = this.game.gui.getItem(rawX, rawY);
    this.game.gui.designerSelection(item);
    this.game.gui.displayMode = 'designer';

    for (const button of this.buttons) {
      if (button.isOver(rawX, rawY)) {
        if (button.getType() === 'mapselect') {
          sendMessage({ type: 'UpdateMap', mapNum: button.getSlotNum() });
        } else {
          button.setType((!this.readyStates[this.team] ? 'ready' : 'notready'));
          sendMessage({ type: 'SetReadyState', readyState: !this.readyStates[this.team] });
        }
      }
    }
  }
}

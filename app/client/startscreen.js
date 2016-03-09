import MapSelect from '../shared/guibuttons/mapselect';
import { createMap } from '../shared/maps';

export default class StartScreen {
  constructor(images) {
    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.images = images;
    this.team = null;

    this.mapNum = 0;

    this.buttons = [];
    this.buttons.push(new MapSelect('mapselect', 700, 100, 100, 50, 0));
    this.buttons.push(new MapSelect('mapselect', 700, 200, 100, 50, 1));
    this.buttons.push(new MapSelect('mapselect', 700, 300, 100, 50, 2));

    this.buttons[0].selected = true;
  }

  render() {
    this.context.clearRect(0, 0, this.width, this.height);

    this.context.fillStyle = 'cyan';
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.translate(this.width - 250, 50);
    this.context.scale(0.25, 0.25);
    const map = createMap(this.mapNum);
    map.renderMiniMap(this.context, this.images, 0, 0, this.width, this.height);
    this.context.scale(4, 4);
    this.context.translate(-this.width + 250, -50);

    for (const button of this.buttons) {
      button.render(this.context, this.images);
    }

    if (this.team == null) {
      this.renderLoading();
    } else {
      this.context.font = '30px sans-serif';
      this.context.fillStyle = 'black';
      this.context.fillText('You are currently on team: ' + this.team, 50, 50);

      this.context.fillText('Status:', 50, 150);

      let startingY = 200;
      for (const team of Object.keys(this.readyStates)) {
        if (team === this.team) {
          this.context.fillStyle = (this.readyStates[team] ? 'green' : 'red');
          this.context.fillRect(175, startingY, 150, 40);

          this.context.strokeStyle = 'black';
          this.context.save();
          this.context.lineWidth = '4';
          this.context.strokeRect(175, startingY, 150, 40);
          this.context.restore();
        }

        this.context.fillStyle = 'black';
        this.context.fillText('Player ' + team + ':  ' + (this.readyStates[team] ? 'Ready' : 'Not ready'), 50, startingY);

        startingY += 50;
      }
    }
  }

  renderLoading() {
    this.context.font = '30px sans-serif';
    this.context.fillStyle = 'black';
    this.context.fillText('Loading ...', 50, 50);
  }

  _assignTeam({ team, readyStates }) {
    this.team = team;
    this.readyStates = readyStates;
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

  getRawMouseCords(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      rawX: event.clientX - rect.left,
      rawY: event.clientY - rect.top,
    };
  }

  mousedown(event, sendMessage) {
    if (this.team == null) {
      return;
    }

    const { rawX, rawY } = this.getRawMouseCords(event);
    const teamOffset = parseInt(this.team, 10);

    const boxStartX = 175;
    const boxEndX = boxStartX + 150;

    const boxStartY = 200 + 50 * teamOffset;
    const boxEndY = boxStartY + 40;

    if (rawX >= boxStartX && rawX <= boxEndX && rawY >= boxStartY && rawY <= boxEndY) {
      console.log('send it');
      sendMessage({ type: 'SetReadyState', readyState: !this.readyStates[this.team] });
    }

    for (const button of this.buttons) {
      if (button.isOver(rawX, rawY)) {
        sendMessage({ type: 'UpdateMap', mapNum: button.getSlotNum() });
      }
    }
  }
}

import Restart from '../shared/guibuttons/restart';
import RenderList from '../shared/renderlist';

export default class EndScreen {
  constructor(images, winningTeam, team) {
    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('webgl');

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.images = images;

    this.winningTeam = winningTeam;
    this.team = team;

    this.buttons = [];
    this.buttons.push(new Restart('restart', 530, 300, 102, 26, 0));

    this.renderList = new RenderList(this.images.pixelJson);
  }

  render(mainProgram) {
    mainProgram.setup();

    this.context.clearColor(0.0, 0.0, 0.0, 1.0);
    this.context.clear(this.context.COLOR_BUFFER_BIT);

    this.renderList.reset();

    this.renderList.addImage('linen', 0, 0, this.width, this.height);

    if (this.winningTeam === '1') {
      this.renderList.addImage('piratesWinTag', 0, 0);
    } else if (this.winningTeam === '0') {
      this.renderList.addImage('imperialsWinTag', 0, 0);
    }

    if (this.team === this.winningTeam) {
      this.renderList.renderText('You Win!', 550, 200);
    } else {
      this.renderList.renderText('You Lose!', 550, 200);
    }

    for (const button of this.buttons) {
      button.render(this.renderList);
    }

    this.renderList.render(this.context);
  }

  getRawMouseCords(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      rawX: event.clientX - rect.left,
      rawY: event.clientY - rect.top,
    };
  }

  mousedown(event) {
    const { rawX, rawY } = this.getRawMouseCords(event);

    for (const button of this.buttons) {
      if (button.isOver(rawX, rawY)) {
        if (button.getType() === 'restart') {
          return 'start';
        }
      }
    }

    return 'end';
  }
}

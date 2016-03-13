import Restart from '../shared/guibuttons/restart';


export default class EndScreen {
  constructor(images, winningTeam, team) {
    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.images = images;

    this.winningTeam = winningTeam;
    this.team = team;

    this.buttons = [];
    this.buttons.push(new Restart('restart', 530, 300, 102, 26, 0));
  }

  render() {
    this.context.clearRect(0, 0, this.width, this.height);

    this.context.fillStyle = 'linen';
    this.context.fillRect(0, 0, this.width, this.height);

    if (this.winningTeam === '1') {
      this.context.drawImage(this.images.piratesWinTag, 0, 0);
    } else if (this.winningTeam === '0') {
      this.context.drawImage(this.images.imperialsWinTag, 0, 0);
    }

    this.context.font = '50px Perpetua';
    this.context.fillStyle = 'black';
    if (this.team === this.winningTeam) {
      this.context.fillText('You Win!', 500, 200);
    } else {
      this.context.fillText('You Lose!', 500, 200);
    }

    for (const button of this.buttons) {
      button.render(this.context, this.images);
    }

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
          return 'start'
        }
      }
    }

    return 'end';
  }
}

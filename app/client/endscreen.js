export default class EndScreen {
  constructor(images, game) {
    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.images = images;

    this.game = game;
  }

  render() {
    this.context.clearRect(0, 0, this.width, this.height);

    this.context.fillStyle = 'cyan';
    this.context.fillRect(0, 0, this.width, this.height);

    var player0 = this.game.map.getEntity('0');
    var player1 = this.game.map.getEntity('1');

    if (player0.numItems == 0) {
      this.context.fillStyle = 'firebrick';
      this.context.textBaseline = 'top';
      this.context.font = '24px sans-serif';
      this.context.fillText("Red Team Wins", 100, 25);

      this.context.fillStyle = 'black';
      if (this.game.team == '1') {
        this.context.fillText("You Win!", 100, 50);
      } else {
        this.context.fillText("You Lose!", 100, 50);
      }

    } else if (player1.numItems == 0) {
      this.context.fillStyle = 'royalblue';
      this.context.textBaseline = 'top';
      this.context.font = '24px sans-serif';
      this.context.fillText("Blue Team Wins", 100, 25);

      this.context.fillStyle = 'black';
      if (this.game.team == '0') {
        this.context.fillText("You Win!", 100, 50);
      } else {
        this.context.fillText("You Lose!", 100, 50);
      }
    }

    let startingY = 200;
    this.context.fillStyle = 'gray'
    this.context.fillRect(175, startingY - 30, 150, 40);

    this.context.strokeStyle = 'black';
    this.context.save();
    this.context.lineWidth = '4';
    this.context.strokeRect(175, startingY - 30, 150, 40);
    this.context.restore();

    this.context.fillStyle = 'black';
    this.context.fillText('Restart', 200, startingY - 25);
  }

  getRawMouseCords(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      rawX: event.clientX - rect.left,
      rawY: event.clientY - rect.top,
    };
  }

  mousedown(event, sendMessage) {
    const { rawX, rawY } = this.getRawMouseCords(event);
    const teamOffset = parseInt('0', 10);

    const boxStartX = 175;
    const boxEndX = boxStartX + 150;

    const boxStartY = 200 + 50 * teamOffset - 30;
    const boxEndY = boxStartY + 40;

    if (rawX >= boxStartX && rawX <= boxEndX && rawY >= boxStartY && rawY <= boxEndY) {
      console.log('start new game');
      sendMessage({ type: 'StartNewGame' });
      return 'start';
    }

    return 'end';
  }
}

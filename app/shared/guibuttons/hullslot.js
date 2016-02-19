import GuiButton from '../guibutton';


export default class Hullslot extends GuiButton {

  render(context, images) {
    if (this.visible == false) {
      return;
    }

    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, 50, 50);
    }

    context.fillStyle = 'green';
    context.fillRect(this.x, this.y, 50, 50);

    switch (this.rendertype) {
      case 'gunboat':
        context.drawImage(images.gunboat, this.x, this.y, 50, 50);
        break;
      case 'frigate':
        context.drawImage(images.frigate, this.x, this.y, 50, 50);
        break;
      case 'galleon':
        context.drawImage(images.galleon, this.x, this.y, 50, 50);
        break;
      case 'hullslot':
        context.globalAlpha = 0.25;
        context.drawImage(images.ship, this.x, this.y, 50, 50);
        context.globalAlpha = 1.0;
        break;
      default:
        console.error('Trying to render unknown button: ', this.rendertype);
    }
  }

}

import GuiButton from '../guibutton';


export default class Gunslot extends GuiButton {

  render(context, images) {
    if (this.visible == false) {
      return;
    }

    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, 50, 50);
    }

    switch (this.rendertype) {
      case 'roundshot':
        context.fillStyle = 'coral';
        context.fillRect(this.x, this.y, 50, 50);
        context.drawImage(images.roundshot, this.x, this.y, 50, 50);
        break;
      case 'chainshot':
        context.fillStyle = 'coral';
        context.fillRect(this.x, this.y, 50, 50);
        context.drawImage(images.chainshot, this.x, this.y, 50, 50);
        break;
      case 'grapeshot':
        context.fillStyle = 'coral';
        context.fillRect(this.x, this.y, 50, 50);    
        context.drawImage(images.grapeshot, this.x, this.y, 50, 50);
        break;
      case 'shell':
        context.fillStyle = 'coral';
        context.fillRect(this.x, this.y, 50, 50);         
        context.drawImage(images.shell, this.x, this.y, 50, 50);
        break;
      case 'gunslot':
        context.fillStyle = 'coral';
        context.fillRect(this.x, this.y, 50, 50);
        context.globalAlpha = 0.25;
        context.drawImage(images.cannon, this.x, this.y, 50, 50);
        context.globalAlpha = 1.0;
        break;
      default:
        console.error('Trying to render unknown button: ', this.rendertype);
    }
  }

}

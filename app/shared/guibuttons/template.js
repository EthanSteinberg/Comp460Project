import GuiButton from '../guibutton';


export default class Template extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, 50, 50);
    }

    switch (this.rendertype) {
      case 'template':
        context.fillStyle = 'cornsilk';
        context.fillRect(this.x, this.y, 50, 50);
        break;
      case 'templateSelected':
        context.fillStyle = 'cornsilk';
        context.fillRect(this.x, this.y, 50, 50);
        context.drawImage(images.template, this.x, this.y, 50, 50);
        break;
      default:
        console.error('Trying to render unknown button');
    }
  }

}

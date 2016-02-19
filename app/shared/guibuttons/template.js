import GuiButton from '../guibutton';
import * as Hardpoints from '../hardpoint';


export default class Template extends GuiButton {

  render(context, images) {
    context.fillStyle = 'cornsilk';
    context.fillRect(this.x, this.y, 50, 50);

    switch (this.template.hull) {
      case 'gunboat':
        context.drawImage(images.gunboat, this.x, this.y, this.width, this.height);
        break;
      case 'frigate':
        context.drawImage(images.frigate, this.x, this.y, this.width, this.height);
        break;
      case 'galleon':
        context.drawImage(images.galleon, this.x, this.y, this.width, this.height);
        break;
    }

    var i = 0;
    for (const hardpoint of this.template.hardpoints) {
      if (hardpoint != null) {
        Hardpoints.renderTemplate(hardpoint, i, this.x + 10, this.y + 38, context, images);
      }
      i += 1;
    }

    switch (this.rendertype) {
      case 'template':
        break;
      case 'templateSelected':
        context.strokeStyle = 'cyan';
        context.strokeRect(this.x, this.y, 50, 50);
        break;
      default:
        console.error('Trying to render unknown button');
    }
  }

}

import GuiButton from '../guibutton';
import * as Hardpoints from '../hardpoint';


export default class Template extends GuiButton {

  render(context, images) {
    context.fillStyle = 'cornsilk';
    context.fillRect(this.x, this.y, 50, 50);
    context.drawImage(images.ship, this.x, this.y, 50, 50);
    var i = 0;
    for (const hardpoint of this.template.hardpoints) {
      if (hardpoint != null) {
        Hardpoints.renderTemplate(hardpoint, i, this.x, this.y, context, images);
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

import GuiButton from '../guibutton';
import * as Hardpoints from '../hardpoint';


export default class Template extends GuiButton {

  render(renderList) {
    renderList.addImage('cornsilk', this.x, this.y, 50, 50);

    switch (this.template.hull) {
      case 'gunboat':
        renderList.addImage('gunboat2', this.x, this.y, this.width, this.height);
        break;
      case 'frigate':
        renderList.addImage('frigate2', this.x, this.y, this.width, this.height);
        break;
      case 'galleon':
        renderList.addImage('galleon2', this.x, this.y, this.width, this.height);
        break;
    }

    let i = 0;
    for (const hardpoint of this.template.hardpoints) {
      if (hardpoint != null) {
        Hardpoints.renderTemplate(hardpoint, i, this.x + 10, this.y + 38, renderList);
      }
      i += 1;
    }

    switch (this.rendertype) {
      case 'template':
        break;
      case 'templateSelected':
        renderList.strokeRect('cyan', 4, this.x, this.y, 50, 50);
        break;
      default:
        console.error('Trying to render unknown button');
    }
  }

}

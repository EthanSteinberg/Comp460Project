import GuiButton from '../guibutton';


export default class Hullslot extends GuiButton {

  render(renderList) {
    if (this.visible === false) {
      return;
    }

    if (this.selected) {
      renderList.strokeRect('cyan', 2, this.x, this.y, 50, 50);
    }

    renderList.addImage('green', this.x, this.y, 50, 50);

    switch (this.rendertype) {
      case 'gunboat':
        renderList.addImage('gunboat2', this.x, this.y, 50, 50);
        break;
      case 'frigate':
        renderList.addImage('frigate2', this.x, this.y, 50, 50);
        break;
      case 'galleon':
        renderList.addImage('galleon2', this.x, this.y, 50, 50);
        break;
      case 'hullslot':
        renderList.addImage('ship', this.x, this.y, 50, 50);
        break;
      default:
        console.error('Trying to render unknown button: ', this.rendertype);
    }
  }

}

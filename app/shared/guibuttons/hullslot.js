import GuiButton from '../guibutton';


export default class Hullslot extends GuiButton {

  render(renderList) {
    if (this.visible === false) {
      return;
    }

    if (this.selected) {
      renderList.strokeRect('cyan', 2, this.x, this.y, this.width, this.height);
    }

    renderList.addImage('green', this.x, this.y, this.width, this.height);

    switch (this.rendertype) {
      case 'gunboat':
        renderList.addImage('gunboat2', this.x, this.y, this.width, this.height);
        break;
      case 'frigate':
        renderList.addImage('frigate2', this.x, this.y, this.width, this.height);
        break;
      case 'galleon':
        renderList.addImage('galleon2', this.x, this.y, this.width, this.height);
        break;
      case 'hullslot':
        renderList.addImage('ship', this.x, this.y, this.width, this.height);
        break;
      default:
        console.error('Trying to render unknown button: ', this.rendertype);
    }
  }

}

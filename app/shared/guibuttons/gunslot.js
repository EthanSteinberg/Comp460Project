import GuiButton from '../guibutton';


export default class Gunslot extends GuiButton {

  render(renderList) {
    if (this.visible === false) {
      return;
    }

    if (this.selected) {
      renderList.addImage('cyan', this.x, this.y, 50, 50);
    }

    switch (this.rendertype) {
      case 'roundshot':
      case 'chainshot':
      case 'grapeshot':
      case 'shell':
        renderList.addImage('coral', this.x, this.y, 50, 50);
        renderList.addImage(this.rendertype, this.x, this.y, 50, 50);
        break;
      case 'gunslot':
        renderList.addImage('coral', this.x, this.y, 50, 50);
        renderList.addImage('cancelshot', this.x, this.y, 50, 50);
        break;
      default:
        console.error('Trying to render unknown button: ', this.rendertype);
    }
  }

}

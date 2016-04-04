import GuiButton from '../guibutton';


export default class Gunslot extends GuiButton {

  render(renderList) {
    if (this.visible === false) {
      return;
    }

    if (this.selected) {
      renderList.addImage('cyan', this.x, this.y, this.width, this.height);
    }

    switch (this.rendertype) {
      case 'roundshot':
      case 'chainshot':
      case 'grapeshot':
      case 'shell':
        renderList.addImage('coral', this.x, this.y, this.width, this.height);
        renderList.addImage(this.rendertype, this.x, this.y, this.width, this.height);
        break;
      case 'gunslot':
        renderList.addImage('coral', this.x, this.y, this.width, this.height);
        renderList.addImage('cancelshot', this.x, this.y, this.width, this.height);
        break;
      default:
        console.error('Trying to render unknown button: ', this.rendertype);
    }
  }

}

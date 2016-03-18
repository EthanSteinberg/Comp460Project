import GuiButton from '../guibutton';


export default class Shipyard extends GuiButton {

  render(renderList) {
    if (this.selected) {
      renderList.strokeRect('cyan', 2, this.x, this.y, this.width, this.height);
    }

    renderList.addImage('shipyard2', this.x, this.y, this.width, this.height);
  }

}

import GuiButton from '../guibutton';


export default class Recycle extends GuiButton {

  render(renderList) {
    renderList.addImage('recycle', this.x, this.y, this.width, this.height);

    if (this.selected) {
      renderList.strokeRect('cyan', 2, this.x, this.y, this.width, this.height);
    }
  }

}

import GuiButton from '../guibutton';


export default class InfinityProduce extends GuiButton {

  render(renderList) {
    renderList.addImage(this.rendertype, this.x, this.y, this.width, this.height);

    if (this.selected) {
      renderList.strokeRect('red', 2, this.x, this.y, this.width, this.height);
    }
  }
}

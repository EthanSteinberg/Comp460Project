import GuiButton from '../guibutton';


export default class Frigate extends GuiButton {

  render(renderList) {
    if (this.type === 'frigateSelected') {
      renderList.addImage('lightgreen', this.x, this.y, this.width, this.height);
    }

    renderList.addImage('greenCircle', this.x - 5, this.y - 5, 50, 50);
    renderList.addImage('frigate2', this.x, this.y, this.width, this.height);
  }
}

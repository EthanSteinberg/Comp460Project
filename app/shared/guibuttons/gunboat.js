import GuiButton from '../guibutton';


export default class Gunboat extends GuiButton {

  render(renderList) {
    if (this.type === 'gunboatSelected') {
      renderList.addImage('lightgreen', this.x, this.y, this.width, this.height);
    }

  
    renderList.addImage('greenCircle', this.x - 5, this.y - 5, 50, 50);
    renderList.addImage('gunboat2', this.x, this.y, this.width, this.height);
  }
}

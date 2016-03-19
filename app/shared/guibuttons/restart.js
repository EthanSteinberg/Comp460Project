import GuiButton from '../guibutton';


export default class Restart extends GuiButton {

  render(renderList) {
    renderList.addImage('restart', this.x, this.y, this.width, this.height);
  }

}

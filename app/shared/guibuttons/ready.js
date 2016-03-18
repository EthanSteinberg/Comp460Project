import GuiButton from '../guibutton';


export default class Ready extends GuiButton {

  render(renderList) {
    renderList.addImage(this.type, this.x, this.y, this.width, this.height);
   }
}

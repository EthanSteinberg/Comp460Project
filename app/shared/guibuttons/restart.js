import GuiButton from '../guibutton';


export default class Restart extends GuiButton {

  render(context, images) {
    context.drawImage(images.restart, this.x, this.y, this.width, this.height);
  }

}

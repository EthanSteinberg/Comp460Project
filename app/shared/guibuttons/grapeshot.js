import GuiButton from '../guibutton';


export default class Grapeshot extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, 50, 50);
    }

    context.drawImage(images.grapeshot, this.x, this.y, 50, 50);
  }

}

import GuiButton from '../guibutton';


export default class Roundshot extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, 50, 50);
    }

    context.drawImage(images.roundshot, this.x, this.y, 50, 50);
  }

}

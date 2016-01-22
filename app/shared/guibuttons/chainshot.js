import GuiButton from '../guibutton';


export default class Chainshot extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, 50, 50);
    }

    context.drawImage(images.chainshot, this.x, this.y, 50, 50);
  }

}

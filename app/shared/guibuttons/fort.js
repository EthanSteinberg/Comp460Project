import GuiButton from '../guibutton';


export default class Fort extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    context.drawImage(images.fort, this.x, this.y, this.width, this.height);
  }

}
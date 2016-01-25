import GuiButton from '../guibutton';


export default class Exit extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    context.fillStyle = 'crimson';
    context.fillRect(this.x, this.y, this.width, this.height);
    context.drawImage(images.exit, this.x, this.y, this.width, this.height);
  }

}

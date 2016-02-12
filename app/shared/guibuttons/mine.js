import GuiButton from '../guibutton';


export default class Mine extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    context.drawImage(images.mine, this.x, this.y, this.width, this.height);
  }

}

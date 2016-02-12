import GuiButton from '../guibutton';


export default class Shipbuilder extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    context.drawImage(images.designer, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
  }
}

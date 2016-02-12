import GuiButton from '../guibutton';


export default class Shipyard extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    context.drawImage(images.shipyard, this.x, this.y, this.width, this.height);
  }

}

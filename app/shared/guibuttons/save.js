import GuiButton from '../guibutton';


export default class Save extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    context.drawImage(images.save, this.x, this.y, this.width, this.height);
 
  }

}

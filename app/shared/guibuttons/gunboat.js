import GuiButton from '../guibutton';


export default class Gunboat extends GuiButton {

  render(context, images) {
    if (this.type == 'gunboatSelected') {
      context.strokeStyle = 'lightgreen';
      context.strokeRect(this.x, this.y, 50, 50);
    }

    context.drawImage(images.gunboat, this.x, this.y, 50, 50);
   }

}

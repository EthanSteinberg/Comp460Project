import GuiButton from '../guibutton';


export default class Galleon extends GuiButton {

  render(context, images) {
    if (this.type == 'galleonSelected') {
      context.strokeStyle = 'lightgreen';
      context.strokeRect(this.x, this.y, 50, 50);
    }

    context.font = '20px sans-serif';
    context.fillStyle = 'black';

  	context.drawImage(images.galleon, this.x, this.y, 50, 50);
  }

}

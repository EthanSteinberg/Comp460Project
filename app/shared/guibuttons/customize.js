import GuiButton from '../guibutton';


export default class Customize extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, 50, 50);
    }

    context.fillStyle = 'red';
    context.fillRect(this.x, this.y, 50, 50);
    context.fillStyle = 'black';
    context.fillText('CUSTOMIZE', this.x, this.y + 15);   
  }

}

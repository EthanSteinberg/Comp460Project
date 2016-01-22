import GuiButton from '../guibutton';


export default class Save extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, 50, 50);
    }

    context.fillStyle = 'red';
    context.fillRect(this.x, this.y, 50, 50);
    context.fillStyle = 'black';
    context.fillText('SAVE', this.x + 5, this.y + 15);   
  }

}

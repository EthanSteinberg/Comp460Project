import GuiButton from '../guibutton';


export default class Overwrite extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    context.font = '20px Courier New';
    context.fillStyle = 'crimson';
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = 'black';
    context.fillText('OVERWRITE', this.x, this.y + 15);   
  }

}

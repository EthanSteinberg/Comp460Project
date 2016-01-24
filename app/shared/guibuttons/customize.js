import GuiButton from '../guibutton';


export default class Customize extends GuiButton {

  render(context, images) {
    
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    context.font = '20px Courier New';
    if (this.visible == false) {
      context.fillStyle = 'gray';
    } else {
      context.fillStyle = 'crimson';
    }
    context.fillRect(this.x, this.y, this.width, this.height);
    if (this.visible == false) {
      context.fillStyle = 'silver';
    } else {
      context.fillStyle = 'black';
    }
    context.fillText('CUSTOMIZE', this.x, this.y + 15);   
  }

}

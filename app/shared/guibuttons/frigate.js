import GuiButton from '../guibutton';


export default class Frigate extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, 50, 50);
    }
    
    context.font = '20px sans-serif';
    context.fillStyle = 'black';

    context.drawImage(images.frigate, this.x, this.y, 50, 50);
    context.fillText('FRIGATE', this.x, this.y + 60);     
  }

}

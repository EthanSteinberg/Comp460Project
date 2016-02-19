import GuiButton from '../guibutton';


export default class Frigate extends GuiButton {

  render(context, images) {
    if (this.type == 'frigateSelected') {
      context.strokeStyle = 'lightgreen';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    context.fillStyle = 'lightgreen';
  	context.beginPath();
  	context.arc(this.x + this.width/2, this.y + this.width/2, this.height/2 + 5, 0, Math.PI * 2, true);
  	context.fill();

    context.drawImage(images.frigate, this.x, this.y, this.width, this.height);
  }

}

import GuiButton from '../guibutton';


export default class Shiptemplate extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    switch (this.type) {
      case 'shiptemplate':
		context.drawImage(images.ship, this.x, this.y, this.width, this.height);
        break;
      case 'shiptemplateGrayed':
  	  	context.globalAlpha=0.25;
		context.drawImage(images.ship, this.x, this.y, this.width, this.height);
      	context.fillStyle="gray"; 
		context.fillRect(this.x,this.y,this.width,this.height);
		context.globalAlpha=1.0;
        break;
    }
  }

}

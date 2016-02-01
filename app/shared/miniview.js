import GuiButton from './guibutton';

export default class MiniView extends GuiButton {

  render(context, images, x, y, width, height, SCALE) {
  	this.x = x;
  	this.y = y;
  	this.width = width;
  	this.height = height;
    this.SCALE = SCALE;

    context.strokeStyle = 'Fuchsia';
    context.globalAlpha = .25;
    context.fillRect((this.x/this.SCALE)+50, (this.y/this.SCALE)+50, 
      this.width/this.SCALE - 100, this.height/this.SCALE);
    context.globalAlpha = 1.0; 
  }

  setView(mouseX, mouseY) {
    var newX = (mouseX*.25 + (this.width - 175))
    var newY = (mouseY*.25 + (25))

    console.log(newX, newY);
    console.log(this.x, this.y);

    if (newX > (this.x/this.SCALE)+50 && newX < this.width/this.SCALE - 100) {
      if (newY > (this.y/this.SCALE)+50 && newY < this.height/this.SCALE) {
        this.x = newX;
        this.y = newY;
        return {x: this.x, y: this.y}
      }
    }

    return null;
  }

}

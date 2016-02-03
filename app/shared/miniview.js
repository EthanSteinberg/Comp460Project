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
    context.fillRect((this.x/this.SCALE)+100, (this.y/this.SCALE)+100, 
      this.width/this.SCALE - 100, this.height/this.SCALE);
    context.globalAlpha = 1.0; 
  }

  setView(mouseX, mouseY, mapWidth, mapHeight) {
    var newX = (mouseX - (this.width - 175))*this.SCALE
    var newY = (mouseY - 25)*this.SCALE

    if (newX > -25 && newX < mapWidth) {
      if (newY > -25 && newY < mapHeight) {
        console.log(this.x, this.y)
        this.x = newX;
        this.y = newY;
        console.log(this.x, this.y)
        return {x: this.x, y: this.y}
      }
    }

    return null;
  }

}

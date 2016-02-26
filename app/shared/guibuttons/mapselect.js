import GuiButton from '../guibutton';


export default class MapSelect extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'red';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    context.fillStyle = 'cornsilk';
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = 'black';
    context.textBaseline = 'top';
    context.font = '25px sans-serif';
    context.fillText('Map ' + this.slotNum, this.x+10, this.y+10);
  }

}

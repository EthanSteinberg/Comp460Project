import GuiButton from '../guibutton';


export default class MapSelect extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'red';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    switch (this.rendertype) {
      case 'westindies':
        context.drawImage(images.westindies, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        break;
      case 'tropics':
        context.drawImage(images.tropics, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        break;
      case 'greatlakes':
        context.drawImage(images.greatlakes, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        break;
    }
  }

}

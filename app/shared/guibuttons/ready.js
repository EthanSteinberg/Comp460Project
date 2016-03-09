import GuiButton from '../guibutton';


export default class Ready extends GuiButton {

  render(context, images) {
    switch (this.type) {
      case 'ready':
        context.drawImage(images.ready, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        break;
      case 'notready':
        context.drawImage(images.notready, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        break;
    }
  }

}

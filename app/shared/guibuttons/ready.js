import GuiButton from '../guibutton';


export default class Ready extends GuiButton {

  render(context, images) {
    switch (this.type) {
      case 'ready':
        context.drawImage(images.ready, this.x, this.y, this.width, this.height);
        break;
      case 'notready':
        context.drawImage(images.notready, this.x, this.y, this.width, this.height);
        break;
    }
  }

}

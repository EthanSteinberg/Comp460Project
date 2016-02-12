import GuiButton from '../guibutton';


export default class TargetToggle extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    switch (this.type) {
      case 'hull':
        context.drawImage(images.targettoggleCannon, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        break;
      case 'hardpoints':
        context.drawImage(images.targettoggleHull, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        break;
    }
  }

}

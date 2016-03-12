import GuiButton from '../guibutton';


export default class TargetToggle extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    switch (this.type) {
      case 'hull':
        context.drawImage(images.targettoggleCannon, this.x, this.y, this.width, this.height);
        break;
      case 'hardpoints':
        context.drawImage(images.targettoggleHull, this.x, this.y, this.width, this.height);
        break;
    }
  }

}

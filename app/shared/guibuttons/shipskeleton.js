import GuiButton from '../guibutton';

export default class ShipSkeleton extends GuiButton {

  render(context, images) {
    context.drawImage(images.shipskeleton, this.x, this.y, this.width, this.height);
   }

}

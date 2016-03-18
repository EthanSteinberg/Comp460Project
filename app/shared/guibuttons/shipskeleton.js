import GuiButton from '../guibutton';

export default class ShipSkeleton extends GuiButton {

  render(renderList) {
  	renderList.addImage('shipskeleton', this.x, this.y, this.width, this.height);
   }

}

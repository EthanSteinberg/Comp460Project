import GuiButton from '../guibutton';


export default class Shiptemplate extends GuiButton {

  render(context, images) {
    if (this.selected) {
      context.strokeStyle = 'cyan';
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    switch (this.type) {
      case 'shiptemplate':
        const count = this.selection.counters[this.slotNum];
        context.fillStyle = 'black';
        context.fillText(count.toString(), this.x, this.y);
        context.drawImage(images.ship, this.x, this.y, this.width, this.height);

        if (this.selection.buildingQueue.length > 0 &&
          this.selection.buildingQueue[0].templateNumber === this.slotNum) {
          context.save();
          context.beginPath();
          context.rect(this.x, this.y, 50, 50);
          context.clip();

          const angle = this.selection.progressTowardsNextBuild / 100 * Math.PI * 2;

          context.globalCompositeOperation = 'multiply';
          context.fillStyle = 'rgba(0,0,0,.5)';
          context.beginPath();
          context.arc(this.x + 25, this.y + 25, 50, 0, angle, true);
          context.lineTo(this.x + 25, this.y + 25);
          context.fill();
          context.globalCompositeOperation = 'source-over';

          context.strokeStyle = 'white';
          context.beginPath();
          context.moveTo(this.x + 25, this.y + 25);
          context.lineTo(this.x + 50, this.y + 25);
          context.arc(this.x + 25, this.y + 25, 50, 0, angle, true);
          context.lineTo(this.x + 25, this.y + 25);
          context.stroke();

          context.restore();
        }
        break;
      case 'shiptemplateGrayed':
        context.globalAlpha = 0.25;
        context.drawImage(images.ship, this.x, this.y, this.width, this.height);
        context.fillStyle = 'gray';
        context.fillRect(this.x, this.y, this.width, this.height);
        context.globalAlpha = 1.0;
        break;
    }
  }

}

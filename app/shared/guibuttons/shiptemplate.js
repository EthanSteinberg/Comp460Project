import GuiButton from '../guibutton';
import { getStats } from '../template';
import * as Hardpoints from '../hardpoint';

export default class Shiptemplate extends GuiButton {

  render(renderList) {
    if (this.selected) {
      renderList.strokeRect('cyan', 2, this.x, this.y, this.width, this.height);
    }

    switch (this.type) {
      case 'shiptemplate':
        renderList.addImage('grayBack', this.x, this.y, this.width, this.height);

        switch (this.template.hull) {
          case 'gunboat':
            renderList.addImage('gunboat2', this.x, this.y, this.width, this.height);
            break;
          case 'frigate':
            renderList.addImage('frigate2', this.x, this.y, this.width, this.height);
            break;
          case 'galleon':
            renderList.addImage('galleon2', this.x, this.y, this.width, this.height);
            break;
          default:
            throw new Error('unhandled switch statement in shiptemplate');
        }

        let i = 0;
        for (const hardpoint of this.template.hardpoints) {
          if (hardpoint != null) {
            Hardpoints.renderTemplate(hardpoint, i, this.x + 10, this.y + 38, renderList);
          }
          i += 1;
        }

        const count = this.selection.counters[this.slotNum];
        renderList.renderText(count.toString(), this.x, this.y, 0.5);

        if (this.selection.buildingQueue.length > 0 &&
          this.selection.buildingQueue[0].templateNumber === this.slotNum) {
          const nextTemplate = this.selection.buildingQueue[0].template;
          const stats = getStats(nextTemplate);

          const angle = this.selection.progressTowardsNextBuild / stats.tcost * Math.PI * 2;
          renderList.addCircleCutout('quarterAlphaGray', angle, this.x, this.y, this.width, this.height);
        }
        break;
      case 'shiptemplateGrayed':

        renderList.addImage('grayBack', this.x, this.y, this.width, this.height);

        switch (this.template.hull) {
          case 'gunboat':
            renderList.addImage('gunboat2', this.x, this.y, this.width, this.height);
            break;
          case 'frigate':
            renderList.addImage('frigate2', this.x, this.y, this.width, this.height);
            break;
          case 'galleon':
            renderList.addImage('galleon2', this.x, this.y, this.width, this.height);
            break;
          default:
            throw new Error('unhandled switch statement in shiptemplate');
        }

        i = 0;
        for (const hardpoint of this.template.hardpoints) {
          if (hardpoint != null) {
            Hardpoints.renderTemplate(hardpoint, i, this.x + 10, this.y + 38, renderList);
          }
          i += 1;
        }

        renderList.addImage('quarterAlphaGray', this.x, this.y, this.width, this.height);

        break;
      default:
        throw new Error('unhandled switch statement in shiptemplate');
    }
  }

}

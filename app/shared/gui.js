import buildingConstants from './buildingconstants';
import { roundshot, grapeshot, chainshot, shell, bombard,
  gunboat, frigate, galleon, dreadnought, getStats } from './template';

import Shipyard from './guibuttons/shipyard';
import Mine from './guibuttons/mine';
import Fort from './guibuttons/fort';
import Shiptemplate from './guibuttons/shiptemplate';
import Shipbuilder from './guibuttons/shipbuilder';
import Roundshot from './guibuttons/roundshot';
import Grapeshot from './guibuttons/grapeshot';
import Shell from './guibuttons/shell';
import Bombard from './guibuttons/bombard';
import Cancelshot from './guibuttons/cancelshot';
import Exit from './guibuttons/exit';
import Template from './guibuttons/template';
import Gunboat from './guibuttons/gunboat';
import Frigate from './guibuttons/frigate';
import Galleon from './guibuttons/galleon';
import Dreadnought from './guibuttons/dreadnought';
import ShipSkeleton from './guibuttons/shipskeleton';
import Gunslot from './guibuttons/gunslot';
import Hullslot from './guibuttons/hullslot';
import Save from './guibuttons/save';
import Recycle from './guibuttons/recycle';
import InfinityProduce from './guibuttons/infinityproduce';

export const GUI_WIDTH = 200;

/**
 * A map of the game containing islands and all current ships.
 */
export default class Gui {

  constructor(canvasWidth, canvasHeight, templates, selectionState, map, team) {
    this.width = GUI_WIDTH;
    this.height = canvasHeight;

    this.x = canvasWidth - this.width;
    this.y = 0;

    this.designerButtons = [];

    this.templates = templates;

    this.selectionState = selectionState;

    this.map = map;

    this.displayMode = 'main';
    this.displayContext = 'game';

    this.changing = false;
    this.selectedSlot = null;
    this.chosenIndex = 0;
    this.workingTemplate = JSON.parse(JSON.stringify(this.templates[this.chosenIndex]));

    this.team = team;

    this.infProduceInfo = null;
  }

  setSelectionState(newSelectionState) {
    this.selectionState = newSelectionState;
  }

  getSelectedMapItems() {
    return this.selectionState.map.map(id => this.map.getEntity(id)).filter(item => item != null);
  }

  selectTemplate(info) {
    this.infProduceInfo = info
  }

  /**
   * Render the gui
   */
  render(renderList, map, hoverCoords) {
    renderList.addImage('black', this.x - 2, this.y, 4, this.height);

    if (this.displayMode === 'main') {
      this.renderMain(renderList, map, hoverCoords);
    } else if (this.displayMode === 'designer') {
      this.renderDesigner(renderList, map, hoverCoords);
    }
  }

  renderDesigner(renderList, map, hoverCoords) {
    renderList.addImage('grey', this.x, this.y, this.width, this.height);

    // // titles
    renderList.addImage('saveSlots', this.x + 20, this.y + 5);

    const skeleton = new ShipSkeleton('shipskeleton', this.x + 50, this.y + 110, 100, 340);
    skeleton.render(renderList);

    for (const button of this.getDesignerButtons().reverse()) {
      const isSelected = this.selectionState.gui != null && this.selectionState.gui.type === button.type &&
        this.selectionState.gui.slotNum === button.slotNum;
      button.selected = isSelected;
      button.render(renderList);
    }

    // // Display stats at the bottom of the gui

    renderList.renderText(this.workingTemplate.hull.toUpperCase(),
      this.x + 5, this.height - 50, 0.5);

    renderList.renderText('Cost: ' + getStats(this.workingTemplate).cost + ' coin',
      this.x + 5, this.height - 35, 0.7);

    renderList.renderText('Time: ' + getStats(this.workingTemplate).tcost + ' sec',
      this.x + 5, this.height - 20, 0.7);


    // Hovering logic
    if (hoverCoords != null) {
      const roundedX = hoverCoords.x;
      const roundedY = hoverCoords.y;

      const item = this.getItem(roundedX, roundedY);

      if (item != null) {
        let details = null;
        let type = item.getType();

        if (type === 'gunslot' && item.rendertype !== 'gunslot') {
          type = item.rendertype;
        }

        switch (type) {
          case 'gunboat':
          case 'gunboatSelected':
            details = gunboat;
            break;
          case 'frigate':
          case 'frigateSelected':
            details = frigate;
            break;
          case 'galleon':
          case 'galleonSelected':
            details = galleon;
            break;
          case 'dreadnought':
          case 'dreadnoughtSelected':
            details = dreadnought;
            break;
          case 'roundshot':
            details = roundshot;
            break;
          case 'chainshot':
            details = chainshot;
            break;
          case 'grapeshot':
            details = grapeshot;
            break;
          case 'shell':
            details = shell;
            break;
          case 'bombard':
            details = bombard;
            break;
          default:
            details = null;
        }


        if (details != null) {
          // Display a tooltip
          let modifier = 0;
          if ((roundedX - 2) > this.x + this.width / 2 - 100) {
            modifier = this.width / 2 * -1;
          }

          renderList.strokeRect('black', 4, (roundedX - 2) + modifier, (roundedY + 1), 200, 65);
          renderList.addImage('white', (roundedX - 2) + modifier, (roundedY + 1), 200, 65);

          renderList.renderText(details.name, (roundedX - 2) + modifier, (roundedY + 1), 0.5);
          renderList.renderText(details.description, (roundedX - 2) + modifier, (roundedY + 1) + 20, 0.5);
          renderList.renderText('Cost: ' + details.cost + ' coin', (roundedX - 2) + modifier, (roundedY + 1) + 34, 0.5);
          renderList.renderText('Time: ' + details.tcost + ' seconds', (roundedX - 2) + modifier, (roundedY + 1) + 47, 0.5);
        }
      }
    }
  }

  renderMain(renderList, map, hoverCoords) {
    renderList.addImage('grey', this.x, this.y, this.width, this.height);

    const moneyText = Math.floor(map.getEntity(this.team).coins).toString();

    renderList.renderText(moneyText, this.x + 32, this.y + 10);

    const width = 14.5 * moneyText.length;

    renderList.strokeRect('black', 2, this.x + 2, this.y + 4, width + 50, 40);
    renderList.addImage('coin2', (this.x) + 2, (this.y) + 10, 25, 25);

    if (this.team === '1') {
      renderList.renderText('Pirates', (this.x) + 50, (this.y) + 470);
    } else {
      renderList.renderText('Imperials', (this.x) + 35, (this.y) + 470);
    }

    for (const button of this.getButtons()) {
      const isSelected = this.selectionState.gui != null && this.selectionState.gui.type === button.type &&
        this.selectionState.gui.slotNum === button.slotNum;
      button.selected = isSelected;
      button.render(renderList);
    }

    if (hoverCoords != null) {
      const roundedX = hoverCoords.x;
      const roundedY = hoverCoords.y;

      let modifier = 0;
      if ((roundedX - 2) > this.x + this.width / 2 - 100) {
        modifier = this.width / 2 * -1;
      }

      const item = this.getItem(roundedX, roundedY);

      if (item != null && item.isBuilding()) {
        const buildingType = item.getBuilding();

        const details = buildingConstants[buildingType];

        // Display a tooltip
        renderList.strokeRect('black', 2, (roundedX - 2) + modifier, (roundedY + 1), 200, 65);
        renderList.addImage('white', (roundedX - 2) + modifier, (roundedY + 1), 200, 65);

        renderList.renderText(details.name, (roundedX - 2) + modifier, (roundedY + 1), 0.5);
        renderList.renderText(details.description, (roundedX - 2) + modifier, (roundedY + 1) + 20, 0.5);
        renderList.renderText('Cost: ' + details.coinCost + ' coin', (roundedX - 2) + modifier, (roundedY + 1) + 34, 0.5);
        renderList.renderText('Time: ' + details.buildTime + ' seconds', (roundedX - 2) + modifier, (roundedY + 1) + 47, 0.5);
      } else if (item != null && (item.getType() === 'shiptemplate' || item.getType() === 'shiptemplateGrayed')) {
        const template = this.templates[item.slotNum];
        renderList.strokeRect('cyan', 2, item.x, item.y, item.width, item.height);

        renderList.strokeRect('black', 2, (roundedX - 2) + modifier, (roundedY + 1), 200, 31);
        renderList.addImage('white', (roundedX - 2) + modifier, (roundedY + 1), 200, 31);

        renderList.renderText('Cost: ' + getStats(template).cost + ' coin', (roundedX - 2) + modifier, (roundedY + 1), 0.5);
        renderList.renderText('Time: ' + getStats(template).tcost + ' seconds', (roundedX - 2) + modifier, (roundedY + 1) + 13, 0.5);
      }
    }
  }

  getUnitButtons() {
    const result = [];
    if (this.getSelectedMapItems().length !== 0 && this.getSelectedMapItems().every(entity => entity.type === 'shipyard')) {
      result.push(new Shiptemplate('shiptemplate', this.x + 20, this.y + 325, 50, 50, 0,
        this.getSelectedMapItems()[0], this.templates[0]));
      result.push(new Shiptemplate('shiptemplate', this.x + 75, this.y + 325, 50, 50, 1,
        this.getSelectedMapItems()[0], this.templates[1]));
      result.push(new Shiptemplate('shiptemplate', this.x + 130, this.y + 325, 50, 50, 2,
        this.getSelectedMapItems()[0], this.templates[2]));

      if (this.infProduceInfo) {
        if (this.getSelectedMapItems().every(entity => entity.id === this.infProduceInfo.shipyardId)) {
          switch (this.infProduceInfo.templateNumber) {
            case 0:
              result.push(new InfinityProduce('infinitySelected', this.x + 20, this.y + 377, 50, 26, 0,
                this.getSelectedMapItems()[0], this.templates[0]));

              result.push(new InfinityProduce('infinity', this.x + 75, this.y + 377, 50, 26, 1,
                this.getSelectedMapItems()[0], this.templates[1]));
              result.push(new InfinityProduce('infinity', this.x + 130, this.y + 377, 50, 26, 2,
                this.getSelectedMapItems()[0], this.templates[2]));
              break;
            case 1:
              result.push(new InfinityProduce('infinitySelected', this.x + 75, this.y + 377, 50, 26, 1,
                this.getSelectedMapItems()[0], this.templates[1]));  

              result.push(new InfinityProduce('infinity', this.x + 20, this.y + 377, 50, 26, 0,
                this.getSelectedMapItems()[0], this.templates[0]));
              result.push(new InfinityProduce('infinity', this.x + 130, this.y + 377, 50, 26, 2,
                this.getSelectedMapItems()[0], this.templates[2]));     
              break;
            case 2:
              result.push(new InfinityProduce('infinitySelected', this.x + 130, this.y + 377, 50, 26, 2,
                this.getSelectedMapItems()[0], this.templates[2]));
              result.push(new InfinityProduce('infinity', this.x + 20, this.y + 377, 50, 26, 0,
                this.getSelectedMapItems()[0], this.templates[0]));
              result.push(new InfinityProduce('infinity', this.x + 75, this.y + 377, 50, 26, 1,
                this.getSelectedMapItems()[0], this.templates[1]));
              break;
          }
        } else {
          result.push(new InfinityProduce('infinityGrayed', this.x + 20, this.y + 377, 50, 26, 0, null, this.templates[0]));
          result.push(new InfinityProduce('infinityGrayed', this.x + 75, this.y + 377, 50, 26, 1, null, this.templates[1]));
          result.push(new InfinityProduce('infinityGrayed', this.x + 130, this.y + 377, 50, 26, 2, null, this.templates[2]));          
        }        
      } else {
        result.push(new InfinityProduce('infinity', this.x + 20, this.y + 377, 50, 26, 0,
          this.getSelectedMapItems()[0], this.templates[0]));
        result.push(new InfinityProduce('infinity', this.x + 75, this.y + 377, 50, 26, 1,
          this.getSelectedMapItems()[0], this.templates[1]));
        result.push(new InfinityProduce('infinity', this.x + 130, this.y + 377, 50, 26, 2,
          this.getSelectedMapItems()[0], this.templates[2]));        
      }
    } else {
      result.push(new InfinityProduce('infinityGrayed', this.x + 20, this.y + 377, 50, 26, 0, null, this.templates[0]));
      result.push(new InfinityProduce('infinityGrayed', this.x + 75, this.y + 377, 50, 26, 1, null, this.templates[1]));
      result.push(new InfinityProduce('infinityGrayed', this.x + 130, this.y + 377, 50, 26, 2, null, this.templates[2]));

      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 20, this.y + 325, 50, 50, 0, null, this.templates[0]));
      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 75, this.y + 325, 50, 50, 1, null, this.templates[1]));
      result.push(new Shiptemplate('shiptemplateGrayed', this.x + 130, this.y + 325, 50, 50, 2, null, this.templates[2]));
    }

    result.push(new Shipyard('shipyard', this.x + 25, this.y + 175, 50, 50));
    result.push(new Mine('mine', this.x + 75, this.y + 175, 50, 50));
    result.push(new Fort('fort', this.x + 130, this.y + 175, 50, 50));
    result.push(new Recycle('recycle', this.x + 75, this.y + 250, 50, 50));

    result.push(new Shipbuilder('shipbuilder', this.x + 50, 415, 102, 26));
    return result;
  }

  getDesignerButtons() {
    const result = [];

    if (this.displayContext === 'game') {
      result.push(new Exit('exit', this.x + this.width - 20, this.y, 20, 20));
    }

    if (this.selectedSlot != null) {
      if (this.selectedSlot.getType() === 'gunslot') {
        result.push(new Roundshot('roundshot', this.selectedSlot.x - 60, this.selectedSlot.y + 5, 40, 40));
        result.push(new Grapeshot('grapeshot', this.selectedSlot.x + 6, this.selectedSlot.y - 50, 40, 40));
        result.push(new Shell('shell', this.selectedSlot.x + 60, this.selectedSlot.y + 5, 40, 40));
        result.push(new Cancelshot('cancelshot', this.selectedSlot.x + 6, this.selectedSlot.y + 60, 40, 40));

        // if (this.workingTemplate.hull == 'dreadnought') {
        //   result.push(new Bombard('bombard', this.selectedSlot.x + 60, this.selectedSlot.y + 120, 40, 40));
        // }
      } else if (this.selectedSlot.getType() === 'hullslot') {
        result.push(new Gunboat('gunboat', this.selectedSlot.x - 60, this.selectedSlot.y + 5, 40, 40));
        result.push(new Frigate('frigate', this.selectedSlot.x + 5, this.selectedSlot.y - 45, 40, 40));
        result.push(new Galleon('galleon', this.selectedSlot.x + 60, this.selectedSlot.y + 5, 40, 40));
        // result.push(new Dreadnought('dreadnought', this.selectedSlot.x + 5, this.selectedSlot.y + 60, 40, 40));
      }
    }

    result.push(new Template('template', this.x + 20, this.y + 25, 50, 50, 0, null, this.templates[0]));
    result.push(new Template('template', this.x + 75, this.y + 25, 50, 50, 1, null, this.templates[1]));
    result.push(new Template('template', this.x + 130, this.y + 25, 50, 50, 2, null, this.templates[2]));

    result.push(new Gunslot('gunslot', this.x + 75, this.y + 210, 40, 40, 0));
    result.push(new Gunslot('gunslot', this.x + 75, this.y + 350, 40, 40, 1));
    result.push(new Hullslot('hullslot', this.x + 75, this.y + 280, 40, 40, 1));

    for (const button of result) {
      button.setVisible(this.chosenIndex != null);

      if (button.getType() === 'template') {
        if (button.getSlotNum() === this.chosenIndex) {
          button.placeItem('templateSelected');
        } else {
          button.placeItem('template');
        }
      } else if (button.getType() === 'hullslot') {
        const ship = this.templates[this.chosenIndex];
        if (this.changing) {
          button.placeItem(this.workingTemplate.hull || 'hullslot');
        } else {
          button.placeItem(this.workingTemplate.hull || ship.hull || 'hullslot');
        }
      } else if (button.getType() === 'gunslot') {
        const ship = this.templates[this.chosenIndex];
        if (this.changing) {
          button.placeItem(this.workingTemplate.hardpoints[button.getSlotNum()] || 'gunslot');
        } else {
          button.placeItem(this.workingTemplate.hardpoints[button.getSlotNum()]
            || ship.hardpoints[button.getSlotNum()] || 'gunslot');
        }
      }
    }

    return result;
  }

  designerSelection(item) {

    if (item == null) {
      this.selectedSlot = null;
      return;
    }

    this.templates[this.chosenIndex] = this.workingTemplate;

    const withItem = JSON.parse(JSON.stringify(this.workingTemplate));

    switch (item.getType()) {
      case 'exit':
        this.displayMode = 'main';
        this.workingTemplate = JSON.parse(JSON.stringify(this.templates[this.chosenIndex]));
        this.changing = false;
        break;
      case 'template':
        this.chosenIndex = item.getSlotNum();
        this.workingTemplate = JSON.parse(JSON.stringify(this.templates[this.chosenIndex]));
        this.changing = false;
        break;
      case 'gunboat':
      case 'frigate':
      case 'galleon':
        this.workingTemplate.hull = item.getType();
        this.selectedSlot = null;
        break;
      case 'gunslot':
      case 'hullslot':
        this.selectedSlot = item;
        break;
      case 'roundshot':
      case 'chainshot':
      case 'grapeshot':
      case 'shell':
        withItem.hardpoints[this.selectedSlot.getSlotNum()] = item.getType();
        this.workingTemplate = withItem;
        this.selectedSlot = null;
        break;
      case 'cancelshot':
        withItem.hardpoints[this.selectedSlot.getSlotNum()] = null;
        this.workingTemplate = withItem;
        this.selectedSlot = null;
        this.changing = true;
        break;
      default:
        this.selectedSlot = null;
    }

    this.templates[this.chosenIndex] = this.workingTemplate;    
  }

  getButtons() {
    return this.getUnitButtons();
  }

  getItem(x, y) {
    if (this.displayMode === 'main') {
      for (const button of this.getButtons()) {
        if (button.isOver(x, y)) {
          return button;
        }
      }
    } else if (this.displayMode === 'designer') {
      for (const button of this.getDesignerButtons()) {
        if (button.isOver(x, y)) {
          return button;
        }
      }
    }

    return null;
  }
}

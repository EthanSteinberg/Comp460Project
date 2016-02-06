import { hardpoints, getStats } from './template';
import Roundshot from './guibuttons/roundshot';
import Grapeshot from './guibuttons/grapeshot';
import Chainshot from './guibuttons/chainshot';
import Shell from './guibuttons/shell';
import Gunboat from './guibuttons/gunboat';
import Frigate from './guibuttons/frigate';
import Galleon from './guibuttons/galleon';
import Gunslot from './guibuttons/gunslot';
import Template from './guibuttons/template';
import Save from './guibuttons/save';
import { statsDisplay } from './guibuttons/statsdisplay';
import InfoDisplay from './guibuttons/infodisplay';
import Customize from './guibuttons/customize';
import Overwrite from './guibuttons/overwrite';
import Select from './guibuttons/select';
import Exit from './guibuttons/exit';

/**
 * A menu for building and customizing ships
 */
export default class ShipbuilderGui {

  constructor(templates) {
    this.canvas = document.getElementById('canvas');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.selected = null;
    this.selectedButton = null;

    this.templates = templates;

    this.workingTemplate = null;
    this.selectedItem = null;

    this.phase = 'templateSelect';

    this.templateButtons = new Map();
    this.hullButtons = new Map();
    this.buttons = new Map();

    this.addTemplateButton(new Template('template', 50, 100, 50, 50, 0));
    this.addTemplateButton(new Template('template', 50, 200, 50, 50, 1));
    this.addTemplateButton(new Template('template', 50, 300, 50, 50, 2));
    this.addTemplateButton(new Customize('customize', 700, 200, 110, 50));
    this.addTemplateButton(new Overwrite('overwrite', 700, 300, 110, 50));
    this.addTemplateButton(new Gunslot('gunslot', 475, 175, 50, 50, 0)); // upper
    this.addTemplateButton(new Gunslot('gunslot', 475, 325, 50, 50, 1)); // bottom
    this.addTemplateButton(new Exit('exit', 900, 5, 25, 25));

    this.addHullButton(new Gunboat('gunboat', 250, 100, 50, 50));
    this.addHullButton(new Frigate('frigate', 400, 100, 50, 50));
    this.addHullButton(new Galleon('galleon', 550, 100, 50, 50));
    this.addHullButton(new Select('select', 700, 300, 80, 50));

    this.addButton(new Gunslot('gunslot', 475, 175, 50, 50, 0)); // upper
    this.addButton(new Gunslot('gunslot', 475, 325, 50, 50, 1)); // bottom

    this.addButton(new Roundshot('roundshot', 700, 50, 50, 50));
    this.addButton(new Chainshot('chainshot', 760, 50, 50, 50));
    this.addButton(new Grapeshot('grapeshot', 820, 50, 50, 50));
    this.addButton(new Shell('shell', 880, 50, 50, 50));

    this.addButton(new Save('save', 820, 400, 60, 50));

    this.infodisplay = new InfoDisplay('infodisplay', 650, 130, 50, 50);
    this.infodisplay.setMessage('');
  }

  addTemplateButton(button) {
    this.templateButtons.set(button.getId(), button);
  }

  addHullButton(button) {
    this.hullButtons.set(button.getId(), button);
  }

  addButton(button) {
    this.buttons.set(button.getId(), button);
  }

  /**
   * Render both the map and all ships on it.
   */
  render(context, images) {
    if (this.phase === 'templateSelect') {
      this.templateSelect(context, images);
    } else if (this.phase === 'hullSelect') {
      this.hullSelect(context, images);
    } else if (this.phase === 'customizeShip') {
      this.customizeShip(context, images);
    }
  }

  templateSelect(context, images) {
    context.fillStyle = 'SlateGrey';
    context.fillRect(0, 0, this.width, this.height);

    context.font = '25px Courier New';
    context.fillStyle = 'black';
    context.fillText('SELECT A SHIP TO CUSTOMIZE', 325, 25);

    // Numbers for templates
    context.font = '20px Courier New';
    context.fillText('LOAD A SAVE SLOT', 20, 70);
    context.fillText('1', 40, 100);
    context.fillText('2', 40, 200);
    context.fillText('3', 40, 300);

    context.font = '15px Courier New';
    context.fillText('Modify the template in', 700, 250);
    context.fillText('the selected save slot.', 700, 270);
    context.fillText('Create a new template', 700, 350);
    context.fillText('in the selected save slot.', 700, 370);

    context.drawImage(images.shipskeleton, 400, 50, 200, 400);

    if (this.chosenIndex != null) {
      statsDisplay(150, 250, getStats(this.templates[this.chosenIndex]), context, images);
    }

    this.infodisplay.render(context, images);

    for (const button of this.templateButtons.values()) {
      button.setVisible(this.chosenIndex != null);

      if (button.getType() === 'template') {
        if (button.getSlotNum() === this.chosenIndex) {
          button.placeItem('templateSelected');
        } else {
          button.placeItem('template');
        }
      } else if (button.getType() === 'gunslot' && this.chosenIndex != null) {
        const ship = this.templates[this.chosenIndex];
        button.placeItem(ship.hardpoints[button.getSlotNum()] || 'gunslot');
      }

      button.render(context, images);
    }
  }

  hullSelect(context, images) {
    context.fillStyle = 'SlateGrey';
    context.fillRect(0, 0, this.width, this.height);

    context.font = '25px Courier New';
    context.fillStyle = 'black';
    context.fillText('SELECT A HULL', 325, 25);

    statsDisplay(150, 250, getStats(this.workingTemplate), context, images);

    this.infodisplay.render(context, images);

    for (const button of this.hullButtons.values()) {
      button.render(context, images);
    }
  }

  customizeShip(context, images) {
    context.fillStyle = 'SlateGrey';
    context.fillRect(0, 0, this.width, this.height);

    context.font = '25px Courier New';
    context.fillStyle = 'black';
    context.fillText('', 400, 25);

    context.font = '20px Courier New';
    context.fillText('Drag and drop components', 50, 50);
    context.fillText('onto your ship.', 50, 70);

    context.fillText('CANNONS', 700, 20);
    context.fillText('SHIP STATS', 150, 220);

    context.font = '15px Courier New';
    context.fillText('round', 700, 100);
    context.fillText('chain', 765, 100);
    context.fillText('grape', 825, 100);
    context.fillText('shell', 885, 100);

    // Display the ship stats
    statsDisplay(150, 250, getStats(this.workingTemplate), context, images);

     // Display the item stats
    if (this.selectedItem != null) {
      context.fillText('ITEM STATS  ' + this.selectedItem, 700, 170);
      statsDisplay(700, 200, hardpoints[this.selectedItem], context, images);
    }

    this.infodisplay.render(context, images);

    context.drawImage(images.shipskeleton, 400, 50, 200, 400);

    for (const button of this.buttons.values()) {
      if (button.getType() === 'gunslot') {
        button.placeItem(this.workingTemplate.hardpoints[button.getSlotNum()] || 'gunslot');
      }
      button.render(context, images);
    }
  }

  select(mouseX, mouseY) {
    let phase;
    if (this.phase === 'templateSelect') {
      for (const button of this.templateButtons.values()) {
        const item = button.select(mouseX, mouseY);
        if (item !== -1) {
          phase = this.selectionLogicTemplateSelect(item);
          if (phase === 'game') {
            return 'game';
          }
        }
      }
    } else if (this.phase === 'hullSelect') {
      for (const button of this.hullButtons.values()) {
        const item = button.select(mouseX, mouseY);
        if (item !== -1) {
          phase = this.selectionLogicHullSelect(item);
          if (phase === 'game') {
            return 'game';
          }
        }
      }
    } else if (this.phase === 'customizeShip') {
      for (const button of this.buttons.values()) {
        const item = button.select(mouseX, mouseY);
        if (item !== -1) {
          return this.selectionLogicCustomize(item);
        }
      }
    }

    return 'shipbuilder';
  }

  updatePos(mouseX, mouseY) {
    if (this.isCannonButton(this.selectedButton)) {
      this.selectedButton.x = mouseX - 25;
      this.selectedButton.y = mouseY - 25;
    }
  }

  releaseItem(mouseX, mouseY) {
    if (this.selectedButton == null) {
      return;
    }

    for (const button of this.buttons.values()) {
      const item = button.select(mouseX, mouseY);
      if (item !== -1) {
        this.releaseLogic(item);
      }
    }

    this.selectedButton.restorePos();

    this.selectedButton = null;
    this.selected = null;
  }

  isCannonButton(button) {
    if (button == null) {
      return false;
    }

    if (button.getType() === 'roundshot'
        || button.getType() === 'chainshot'
        || button.getType() === 'grapeshot'
        || button.getType() === 'shell') {
      return true;
    }
    return false;
  }

  releaseLogic(item) {
    const newbutton = this.buttons.get(item);
    const oldbutton = this.buttons.get(this.selected);

    if (oldbutton != null) {
      if (newbutton.getType() === 'gunslot' && oldbutton.getType() !== 'gunslot') {
        if (this.isCannonButton(oldbutton)) {
          const withItem = JSON.parse(JSON.stringify(this.workingTemplate));
          withItem.hardpoints[newbutton.getSlotNum()] = oldbutton.getType();

          if (getStats(withItem).weight < 0) {
            this.infodisplay.setMessage('Capacity exceeded. Choose another item.');
          } else {
            this.workingTemplate = withItem;
          }

          this.selected = -1;
        }
      }

      if (newbutton !== oldbutton) {
        oldbutton.deselect();
      }
    }
  }

  selectionLogicTemplateSelect(item) {
    const newbutton = this.templateButtons.get(item);

    this.selected = item;
    this.selectedButton = newbutton;

    if (newbutton.getType() === 'exit') {
      return this.exit();
    }

    if (newbutton.getType() === 'template') {
      this.chosenIndex = newbutton.getSlotNum();
    }

    if (newbutton.getType() === 'customize') {
      if (this.chosenIndex == null) {
        this.infodisplay.setMessage('Please select a save slot.');
      } else {
        this.workingTemplate = JSON.parse(JSON.stringify(this.templates[this.chosenIndex]));
        this.phase = 'customizeShip';
      }
    } else if (newbutton.getType() === 'overwrite') {
      if (this.chosenIndex == null) {
        this.infodisplay.setMessage('Please select a save slot.');
      } else {
        this.workingTemplate = { hull: null, hardpoints: [] };
        this.phase = 'hullSelect';
      }
    }
  }

  selectionLogicHullSelect(item) {
    const newbutton = this.hullButtons.get(item);

    if (newbutton.getType() === 'exit') {
      return this.exit();
    }

    if (newbutton.getType() === 'select') {
      if (this.workingTemplate.hull == null) {
        this.infodisplay.setMessage('Please select a hull.');
      } else {
        this.phase = 'customizeShip';
      }
    } else {
      this.workingTemplate.hull = newbutton.getType();
    }
  }

  selectionLogicCustomize(item) {
    const newbutton = this.buttons.get(item);

    this.selected = item;
    this.selectedButton = newbutton;

    if (newbutton.getType() === 'exit') {
      return this.exit();
    }

    if (this.isCannonButton(newbutton)) {
      this.selectedItem = newbutton.getType();
    }

    if (newbutton.getType() === 'save') {
      this.templates[this.chosenIndex] = this.workingTemplate;
      return this.exit();
    }

    return 'shipbuilder';
  }

  exit() {
    this.phase = 'templateSelect';
    return 'game';
  }

  deselect() {
    for (const button of this.buttons.values()) {
      button.deselect();
    }
  }

  emptyslot(x, y) {
    if (this.workingTemplate == null) {
      return;
    }

    for (const button of this.buttons.values()) {
      if (button.isOver(x, y)) {
        if (button.getType() === 'gunslot' || button.getType() === 'hullslot' || button.getType() === 'template') {
          this.workingTemplate.hardpoints[button.getSlotNum()] = null;
        }
      }
    }
  }
}

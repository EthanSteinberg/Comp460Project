import GuiButton from './guibutton';
import Stats from './stats';
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


/**
 * A menu for building and customizing ships
 */
export default class ShipbuilderGui {

  constructor() {
    this.canvas = document.getElementById('canvas');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.selected = null;
    this.selectedButton = null;
    this.selectedTemplate = null;
    this.stats = new Stats();
    this.returnedStats = new Stats();

    this.phase = "hullSelect";

    this.hullButtons = new Map();
    this.buttons = new Map();

    this.addHullButton(new Gunboat('gunboat', 200, 200));
    this.addHullButton(new Frigate('frigate', 400, 200));
    this.addHullButton(new Galleon('galleon', 600, 200));

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
    if (this.phase == "hullSelect") {
      this.hullSelect(context, images);
    } else if (this.phase == "customizeShip") {
      this.customizeShip(context, images);
    }

  }

  hullSelect(context, images) {
    context.font = '25px sans-serif';
    context.fillStyle = 'black';
    context.fillText('SELECT A HULL', this.width/2-100, 25);

    for (const button of this.hullButtons.values()) {
      button.render(context, images);
    }
  }

  customizeShip(context, images) {
    context.fillStyle = 'gray';
    context.fillRect(0, 0, this.width, this.height);

    context.font = '25px sans-serif';
    context.fillStyle = 'black';
    context.fillText('', this.width/2-100, 25);

    context.font = '20px sans-serif';
    context.fillText('CANNONS', 700, 70);

    context.fillText('HULLS', 700, 170);

    context.fillText('STATS', 700, 310);

    context.font = '15px sans-serif';
    context.fillText('Health: ' + this.stats.getHealth(), 700, 335);
    context.fillText('Damage: ' + this.stats.getDamage(), 700, 350);
    context.fillText('Speed: ' + this.stats.getSpeed(), 700, 365);
    context.fillText('Weight: ' + this.stats.getWeight(), 700, 380);
    context.fillText('Wood Cost: ' + this.stats.getWcost(), 700, 395);
    context.fillText('Coin Cost: ' + this.stats.getCcost(), 700, 410);
    context.fillText('Production Time: ' + this.stats.getTcost(), 700, 425);

    context.fillText('Template Number: ' + this.stats.getTemplateNum(), 700, 450);

    //Numbers for templates
    context.fillText('1', 40, 100);
    context.fillText('2', 40, 200);   
    context.fillText('3', 40, 300);

    context.drawImage(images.shipskeleton, this.width/2 - 100, this.height/2 - 200, 200, 400);

    for (const button of this.buttons.values()) {
      button.render(context, images);
    }
  }

  select(mouseX, mouseY) {
    if (this.phase == "hullSelect") {
      for (const button of this.hullButtons.values()) {
        var item = button.select(mouseX, mouseY);
        if(item != -1) {
        this.selectionLogicHullSelect(item);
        }
      }
    } else if (this.phase == "customizeShip") {
      for (const button of this.buttons.values()) {
        var item = button.select(mouseX, mouseY);
        if(item != -1) {
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
      var item = button.select(mouseX, mouseY);
      if(item != -1) {
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

    if (button.getType() == 'roundshot'
        || button.getType() == 'chainshot' 
        || button.getType() == 'grapeshot'
        || button.getType() == 'shell') {
      return true;
    }
    return false;
  }

  releaseLogic(item) {
    var newbutton = this.buttons.get(item);
    var oldbutton = this.buttons.get(this.selected);

    if (oldbutton != undefined) {
      if (newbutton.getType() == 'gunslot' && oldbutton.getType() != 'gunslot'
          && oldbutton.getType() != 'hullslot'
          && newbutton.getType() == newbutton.getRenderType()) {

        if (this.isCannonButton(oldbutton)) {
          newbutton.placeItem(oldbutton.getType());
          this.stats.applyItemEffect(oldbutton.getType());
          this.selected = -1;
        }
      }

      if (newbutton.getType() == 'hullslot' && oldbutton.getType() != 'hullslot'
          && oldbutton.getType() != 'gunslot'
          && newbutton.getType() == newbutton.getRenderType()) {

        if (oldbutton.getType() == 'gunboat'
            || oldbutton.getType() == 'frigate' 
            || oldbutton.getType() == 'galleon') {
          newbutton.placeItem(oldbutton.getType());
          this.stats.applyItemEffect(oldbutton.getType());
          this.selected = -1;
        }
      }

      if (newbutton != oldbutton) {
        oldbutton.deselect();
      }
    }
  }

  selectionLogicHullSelect(item) {
    this.phase = "customizeShip";
    this.buttons.length = 1;

    var newbutton = this.hullButtons.get(item);
    this.stats.applyItemEffect(newbutton.getType());

    this.addButton(new Gunslot('gunslot', this.width/2 - 100, this.height/2-75)); //upper left
    this.addButton(new Gunslot('gunslot', this.width/2 + 50, this.height/2-75)); //uppper right
    this.addButton(new Gunslot('gunslot', this.width/2 - 100, this.height/2+75)); //bottom left
    this.addButton(new Gunslot('gunslot', this.width/2 + 50, this.height/2+75)); //bottom right

    this.addButton(new Roundshot('roundshot', 700, 100));
    this.addButton(new Chainshot('chainshot', 760, 100));
    this.addButton(new Grapeshot('grapeshot', 820, 100));
    this.addButton(new Shell('shell', 880, 100));

    this.addButton(new Template('template', 50, 100, 1));
    this.addButton(new Template('template', 50, 200, 2)); 
    this.addButton(new Template('template', 50, 300, 3));
    this.addButton(new Save('save', 50, 400));
  }

  selectionLogicCustomize(item) {
    var newbutton = this.buttons.get(item);
    var oldbutton = this.buttons.get(this.selected);

    this.selected = item;
    this.selectedButton = newbutton;

    if (newbutton.getType() == 'template') {
      if (this.selectedTemplate != null) {
        this.selectedTemplate.placeItem('template');
      }
      newbutton.placeItem('templateSelected');
      this.selectedTemplate = newbutton;
      this.stats.setTemplateNum(newbutton.getTemplateNum());
    }

    if (newbutton.getType() == 'save') {
      if (this.selectedTemplate == null) {
        alert("Please select a template number");
        return 'shipbuilder';
      }

      this.returnedStats = this.stats;
      this.emptySlots();
      this.stats = new Stats();
      this.phase = 'hullSelect';
      return 'game';
    } else {
      return 'shipbuilder';
    }
  }

  deselect() {
    for (const button of this.buttons.values()) {
      button.deselect();
    }
  }

  emptySlots() {
    for (const button of this.buttons.values()) {
      if (button.getType() == 'gunslot' || button.getType() == 'hullslot' || button.getType() == 'template') {
        button.emptyslot(button.getX()+1, button.getY()+1);
      }
    }
  }

  emptyslot(x, y) {
    for (const button of this.buttons.values()) {
      if (button.getType() == 'gunslot' || button.getType() == 'hullslot' || button.getType() == 'template') {
        var slotType = button.emptyslot(x, y);
        if (slotType != null) {
          this.stats.removeItemEffect(slotType);
        }
      }
    }
  }

  getStats() {
    return this.returnedStats;
  }

}

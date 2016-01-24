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
import StatsDisplay from './guibuttons/statsdisplay';
import InfoDisplay from './guibuttons/infodisplay';
import Customize from './guibuttons/customize';
import Overwrite from './guibuttons/overwrite';
import Select from './guibuttons/select';

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
    this.stats = [new Stats(), new Stats(), new Stats()];
    this.chosenstats = new Stats();
    this.itemstats = new Stats();
    this.returnedStats = new Stats();

    this.phase = "templateSelect";

    this.templateButtons = new Map();
    this.hullButtons = new Map();
    this.buttons = new Map();

    this.addTemplateButton(new Template('template', 50, 100, 50, 50, 1));
    this.addTemplateButton(new Template('template', 50, 200, 50, 50, 2)); 
    this.addTemplateButton(new Template('template', 50, 300, 50, 50, 3));
    this.addTemplateButton(new Customize('customize', 700, 200, 110, 50));
    this.addTemplateButton(new Overwrite('overwrite', 700, 300, 110, 50));
    this.addTemplateButton(new Gunslot('gunslot', this.width/2 - 100, this.height/2-75, 50, 50, 1)); //upper left
    this.addTemplateButton(new Gunslot('gunslot', this.width/2 + 50, this.height/2-75, 50, 50, 2)); //uppper right
    this.addTemplateButton(new Gunslot('gunslot', this.width/2 - 100, this.height/2+75, 50, 50, 3)); //bottom left
    this.addTemplateButton(new Gunslot('gunslot', this.width/2 + 50, this.height/2+75, 50, 50, 4)); //bottom right

    this.showTemplateElements(false);

    this.addHullButton(new Gunboat('gunboat', 250, 100, 50, 50));
    this.addHullButton(new Frigate('frigate', 400, 100, 50, 50));
    this.addHullButton(new Galleon('galleon', 550, 100, 50, 50));
    this.addHullButton(new Select('select', 700, 300, 80, 50));

    this.addButton(new Gunslot('gunslot', this.width/2 - 100, this.height/2-75, 50, 50, 1)); //upper left
    this.addButton(new Gunslot('gunslot', this.width/2 + 50, this.height/2-75, 50, 50, 2)); //uppper right
    this.addButton(new Gunslot('gunslot', this.width/2 - 100, this.height/2+75, 50, 50, 3)); //bottom left
    this.addButton(new Gunslot('gunslot', this.width/2 + 50, this.height/2+75, 50, 50, 4)); //bottom right

    this.addButton(new Roundshot('roundshot', 700, 50, 50, 50));
    this.addButton(new Chainshot('chainshot', 760, 50, 50, 50));
    this.addButton(new Grapeshot('grapeshot', 820, 50, 50, 50));
    this.addButton(new Shell('shell', 880, 50, 50, 50));

    this.addButton(new Save('save', 820, 400, 60, 50));

    this.statsdisplay = new StatsDisplay("statsdisplay", 150, 250, 50, 50);
    this.statsdisplay.setStats(this.chosenstats);

    this.itemstatsdisplay = new StatsDisplay("statsdisplay", 700, 200, 50, 50);
    this.itemstatsdisplay.setStats(this.itemstats);

    this.infodisplay = new InfoDisplay("infodisplay", 650, 130, 50, 50);
    this.infodisplay.setMessage("");
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
    if (this.phase == "templateSelect") {
      this.templateSelect(context, images);
    } else if (this.phase == "hullSelect") {
      this.hullSelect(context, images);
    } else if (this.phase == "customizeShip") {
      this.customizeShip(context, images);
    }
  }

  templateSelect(context, images) {
    context.fillStyle = 'SlateGrey';
    context.fillRect(0, 0, this.width, this.height);

    context.font = '25px Courier New';
    context.fillStyle = 'black';
    context.fillText('SELECT A SHIP TO CUSTOMIZE', this.width/2-175, 25);

    //Numbers for templates
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

    context.drawImage(images.shipskeleton, this.width/2 - 100, this.height/2 - 200, 200, 400);
    this.statsdisplay.render(context, images);
    this.infodisplay.render(context, images);    

    for (const button of this.templateButtons.values()) {
      button.render(context, images);
    }
  }

  hullSelect(context, images) {
    context.fillStyle = 'SlateGrey';
    context.fillRect(0, 0, this.width, this.height);

    context.font = '25px Courier New';
    context.fillStyle = 'black';
    context.fillText('SELECT A HULL', this.width/2-175, 25);

    this.statsdisplay.render(context, images);
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
    context.fillText('', this.width/2-100, 25);

    context.font = '20px Courier New';
    context.fillText('Drag and drop components', 50, 50);
    context.fillText('onto your ship.', 50, 70);

    context.fillText('CANNONS', 700, 20);
    context.fillText('SHIP STATS', 150, 220);
    context.fillText('ITEM STATS  ' + this.itemstatsdisplay.getItemType(), 700, 170);


    context.font = '15px Courier New';
    context.fillText('round', 700, 100);
    context.fillText('chain', 765, 100);
    context.fillText('grape', 825, 100);
    context.fillText('shell', 885, 100);


    this.itemstatsdisplay.render(context, images);
    this.statsdisplay.render(context, images);
    this.infodisplay.render(context, images);

    context.drawImage(images.shipskeleton, this.width/2 - 100, this.height/2 - 200, 200, 400);

    for (const button of this.buttons.values()) {
      button.render(context, images);
    }
  }

  select(mouseX, mouseY) {
    if (this.phase == "templateSelect") {
      for (const button of this.templateButtons.values()) {
        var item = button.select(mouseX, mouseY);
        if(item != -1) {
          this.selectionLogicTemplateSelect(item);
        }
      }
    } else if (this.phase == "hullSelect") {
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
      if (newbutton.getType() == 'gunslot' && oldbutton.getType() != 'gunslot') {

        if (this.isCannonButton(oldbutton)) {
          var belowZero = this.chosenstats.applySlotEffect(oldbutton.getType(), newbutton.getSlotNum());

          if (belowZero) {
            this.infodisplay.setMessage("Capacity exceeded. Choose another item.");
            this.chosenstats.removeItemEffect(oldbutton.getType());
          } else {
            if (newbutton.getType() != newbutton.getRenderType()) {
              this.chosenstats.removeItemEffect(newbutton.getRenderType());
            }

            newbutton.placeItem(oldbutton.getType());
          }

          this.selected = -1;
        }
      }

      if (newbutton != oldbutton) {
        oldbutton.deselect();
      }
    }
  }

  selectionLogicTemplateSelect(item) {
    var newbutton = this.templateButtons.get(item);
    var oldbutton = this.templateButtons.get(this.selected);

    this.selected = item;
    this.selectedButton = newbutton;

    if (newbutton.getType() == 'template') {
      if (this.selectedTemplate != null) {
        this.selectedTemplate.placeItem('template');
      }
      newbutton.placeItem('templateSelected');
      this.selectedTemplate = newbutton;
      this.chosenstats = this.stats[this.selectedTemplate.getSlotNum() - 1];
      this.chosenstats.setTemplateNum(newbutton.getSlotNum());
      this.emptyTemplateSlots();
      this.loadTemplateShip();
      for (const button of this.templateButtons.values()) {
        if (button.getType() == 'gunslot') {
          this.chosenstats.fillSlot(button);
        }
      }

      this.showTemplateElements(true);
    }

    if (newbutton.getType() == 'customize') {
      if (this.selectedTemplate == null) {
        this.infodisplay.setMessage("Please select a save slot.");
      } else {
        if (this.chosenstats.getHealth() == 0) {
          this.phase = "hullSelect";
        } else {
          this.phase = "customizeShip";
          this.loadShip();
        }
        this.selectedTemplate.placeItem('template');
        this.selectedTemplate == null;
        this.showTemplateElements(false);
      }
    } else if (newbutton.getType() == 'overwrite') {
      if (this.selectedTemplate == null) {
        this.infodisplay.setMessage("Please select a save slot.");
      } else  {
        this.chosenstats.zeroStats();
        this.phase = "hullSelect";
        this.selectedTemplate.placeItem('template');
        this.selectedTemplate == null;
        this.showTemplateElements(false);
      }
    }

    this.statsdisplay.setStats(this.chosenstats);
  }

  showTemplateElements(visible) {
    for (const button of this.templateButtons.values()) {
      button.setVisible(visible);
    }  
  }

  loadShip() {
    for (const button of this.buttons.values()) {
      if (button.getType() == 'gunslot') {
        this.chosenstats.fillSlot(button);
      }
    }    
  }

  loadTemplateShip() {
    for (const button of this.templateButtons.values()) {
      if (button.getType() == 'gunslot') {
        this.chosenstats.fillSlot(button);
      }
    }
  }

  selectionLogicHullSelect(item) {
    var newbutton = this.hullButtons.get(item);

    if (newbutton.getType() == 'select') {
      if (this.chosenstats.getHealth() == 0) {
        this.infodisplay.setMessage("Please select a hull.");
      } else {
        this.phase = "customizeShip";
      }
    } else {
      this.chosenstats.zeroStats();
      this.chosenstats.applyItemEffect(newbutton.getType());
      this.statsdisplay.setStats(this.chosenstats);      
    }
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
      this.chosenstats.setTemplateNum(newbutton.getSlotNum());
    }

    if (this.isCannonButton(newbutton)) {
      this.itemstats.zeroStats();
      this.itemstats.applySlotEffect(newbutton.getType(), 0);
    }

    if (newbutton.getType() == 'save') {
      this.returnedStats = this.chosenstats;
      this.emptySlots();
      this.chosenstats = new Stats();
      this.statsdisplay.setStats(this.chosenstats);
      this.emptyTemplateSlots();
      this.selectedTemplate = null;
      this.phase = 'templateSelect';
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

  emptyTemplateSlots() {
    for (const button of this.templateButtons.values()) {
      if (button.getType() == 'gunslot') {
        button.emptyslot(button.getX()+1, button.getY()+1);
      }
    }
  }

  emptyslot(x, y) {
    for (const button of this.buttons.values()) {
      if (button.getType() == 'gunslot' || button.getType() == 'hullslot' || button.getType() == 'template') {
        var slotType = button.emptyslot(x, y);
        if (slotType != null) {
          this.chosenstats.removeSlotEffect(slotType, button.getSlotNum());
        }
      }
    }
  }

  getStats() {
    return this.returnedStats;
  }

}

import GuiButton from './guibutton';
import Stats from './stats';


/**
 * A menu for building and customizing ships
 */
export default class ShipbuilderGui {

  constructor() {
    this.canvas = document.getElementById('canvas');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.selected = null;
    this.selectedTemplate = null;
    this.stats = new Stats();
    this.returnedStats = new Stats();

    this.buttons = new Map();
    this.addButton(new GuiButton('roundshot', 700, 100));
    this.addButton(new GuiButton('chainshot', 760, 100));
    this.addButton(new GuiButton('grapeshot', 820, 100));
    this.addButton(new GuiButton('shell', 880, 100));

    this.addButton(new GuiButton('gunboat', 700, 200));
    this.addButton(new GuiButton('frigate', 760, 200));
    this.addButton(new GuiButton('galleon', 820, 200));

    this.addButton(new GuiButton('hullslot', this.width/2 - 25, this.height/2)); //center
    this.addButton(new GuiButton('gunslot', this.width/2 - 100, this.height/2-75)); //upper left
    this.addButton(new GuiButton('gunslot', this.width/2 + 50, this.height/2-75)); //uppper right
    this.addButton(new GuiButton('gunslot', this.width/2 - 100, this.height/2+75)); //bottom left
    this.addButton(new GuiButton('gunslot', this.width/2 + 50, this.height/2+75)); //bottom right
                
    this.addButton(new GuiButton('template', 50, 100, 1));
    this.addButton(new GuiButton('template', 50, 200, 2)); 
    this.addButton(new GuiButton('template', 50, 300, 3));
    this.addButton(new GuiButton('save', 50, 400));
  }

  addButton(button) {
    this.buttons.set(button.getId(), button);
  }

  /**
   * Render both the map and all ships on it.
   */
  render(context, images) {

    context.fillStyle = 'gray';
    context.fillRect(0, 0, this.width, this.height);

    context.font = '25px sans-serif';
    context.fillStyle = 'black';
    context.fillText('SHIPBUILDMODE', this.width/2-100, 25);

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
    for (const button of this.buttons.values()) {
      var item = button.select(mouseX, mouseY);
      if(item != -1) {
        return this.selectionLogic(item);
      }
    }
    return 'shipbuilder';
  }

  selectionLogic(item) {
    var newbutton = this.buttons.get(item);
    var oldbutton = this.buttons.get(this.selected);

    if (oldbutton != undefined) {
      if (newbutton.getType() == 'gunslot' && oldbutton.getType() != 'gunslot'
          && oldbutton.getType() != 'hullslot'
          && newbutton.getType() == newbutton.getRenderType()) {

        if (oldbutton.getType() == 'roundshot'
            || oldbutton.getType() == 'chainshot' 
            || oldbutton.getType() == 'grapeshot'
            || oldbutton.getType() == 'shell') {
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

    this.selected = item;

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

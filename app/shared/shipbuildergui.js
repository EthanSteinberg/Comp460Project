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
    this.stats = new Stats();

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
    
    this.addButton(new GuiButton('save', 50, 300));
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
    context.fillText('CANNONS', 700, 80);

    context.fillText('HULLS', 700, 180);

    context.fillText('STATS', 700, 350);

    context.font = '15px sans-serif';
    context.fillText('Health: ' + this.stats.getHealth(), 700, 375);
    context.fillText('Damage: ' + this.stats.getDamage(), 700, 390);
    context.fillText('Speed: ' + this.stats.getSpeed(), 700, 405);
    context.fillText('Weight: ' + this.stats.getWeight(), 700, 420);
    context.fillText('Wood Cost: ' + this.stats.getWcost(), 700, 435);
    context.fillText('Coin Cost: ' + this.stats.getCcost(), 700, 450);
    context.fillText('Production Time: ' + this.stats.getTcost(), 700, 465);

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
          this.stats.applyItemEffect(oldbutton.getType(), 1);
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
          this.stats.applyItemEffect(oldbutton.getType(), 1);
          this.selected = -1;
        }
      }
    }

    this.selected = item;

    if (newbutton.getType() == 'save') {
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

  emptyslot(x, y) {
    for (const button of this.buttons.values()) {
      if (button.getType() == 'gunslot' || button.getType() == 'hullslot') {
        var slotType = button.emptyslot(x, y);
        if (slotType != null) {
          this.stats.applyItemEffect(slotType, -1);
        }
      }
    }
  }

  getStats() {
    return this.stats;
  }

}

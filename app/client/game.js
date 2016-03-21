import Gui from '../shared/gui';
import { GUI_WIDTH } from '../shared/gui';
import { createSource } from './audio';

import { defaultTemplate } from '../shared/template';

import RenderList from '../shared/renderlist';

const templates = [defaultTemplate(), defaultTemplate(), defaultTemplate()];

export default class Game {
  /**
   * Contruct the game.
   * Takes as input the images object as produced by images.js
   */
  constructor(images, map, team) {
    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('webgl');

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.selectionState = {
      gui: null,
      map: [],
    };

    this.images = images;
    this.map = map;
    this.gui = new Gui(this.width, this.height, templates, this.selectionState, this.map, team);

    const startingCoords = map.getStartingCoords(team);
    this.centerAround(startingCoords.x, startingCoords.y);
    this.team = team;

    this.startingDownPosition = null;

    this.actionMap = {
      37: () => this.moveGame(-1, 0),
      38: () => this.moveGame(0, -1),
      39: () => this.moveGame(1, 0),
      40: () => this.moveGame(0, 1),
    };

    this.pressedKeys = new Set();

    this.renderList = new RenderList(this.images.pixelJson);
  }

  centerAround(x, y) {
    this.x = Math.min(Math.max(0, x - (this.width - GUI_WIDTH) / 2), this.map.width * 50 - this.width + GUI_WIDTH);
    this.y = Math.min(Math.max(0, y - this.height / 2), this.map.height * 50 - this.height);
  }

  tick() {
    for (const key in this.actionMap) {
      if (this.pressedKeys.has(+key)) {
        this.actionMap[key]();
      }
    }
  }

  moveGame(dx, dy) {
    const newX = this.x + dx;
    const newY = this.y + dy;

    if (newX < 0 || newY < 0) {
      return;
    }

    if (newY + this.height > this.map.height * 50) {
      return;
    }

    if (newX + this.width - GUI_WIDTH > this.map.width * 50) {
      return;
    }

    this.x = newX;
    this.y = newY;
  }

  _updateEntity({ data }) {
    this.map.updateEntity(data);
  }

  _addEntity({ data }) {
    if (data.type === 'projectile') {
      createSource(this.images['cannon-sound']).start(0);
    } else if (data.type === 'ship' && this.team === data.team) {
      if (data.team === '1') {
        createSource(this.images.pirateCommand).start(0);
      } else {
        createSource(this.images.empireCommand).start(0);
      }
    }
    this.map.addEntity(data);
  }

  _removeEntity({ id }) {
    this.map.removeEntity(id);
  }

  updateSelectionState(newState) {
    this.selectionState = newState;

    this.gui.setSelectionState(this.selectionState);
  }

  performMouseUp(event, sendMessage) {
    if (event.button === 0) {
      // Select/Deselect on left click or do button thingy

      const { rawX, rawY } = this.getRawMouseCords(event);

      if (rawX > this.width - GUI_WIDTH) {
        this.processGuiLeftMouseClick(rawX, rawY, sendMessage);
        return;
      }

      this.processMapLeftMouseClick(rawX, rawY, sendMessage);
    } else if (event.button === 2) {
      // Go do stuff on right click,  like move or whatnot

      if (this.selectionState.gui != null) {
        // Stop gui action with right click
        this.updateSelectionState({ ...this.selectionState, gui: null });
        return;
      }

      // Otherwise let's move! (or attack)

      const { rawX, rawY } = this.getRawMouseCords(event);

      if (rawX > this.width - GUI_WIDTH) {
        this.procesGuiRightMouseClick(rawX, rawY, sendMessage);
        return;
      }

      if (this.getSelectedMapItems().length !== 0) {
        this.processRightClickOnMap(rawX, rawY, sendMessage);
      }
    }
  }

  mouseup(event, sendMessage) {
    this.performMouseUp(event, sendMessage);

    this.mouseDownRawPosition = null;
    this.mouseDownGamePosition = null;
  }

  mousedown(event) {
    const { rawX, rawY } = this.getRawMouseCords(event);

    this.mouseDownRawPosition = { rawX, rawY };

    if (rawX < this.width - GUI_WIDTH) {
      this.mouseDownGamePosition = this.getMouseGamePosition(rawX, rawY);
    }
  }

  getMouseGamePosition(rawX, rawY) {
    const x = rawX + this.x - 25;
    const y = rawY + this.y - 25;

    // The mouse coordinates in grid coordinatess.
    let mouseX = x / (50);
    let mouseY = y / (50);

    return { mouseX, mouseY };
  }

  processRightClickOnMap(rawX, rawY, sendMessage) {
    const { mouseX, mouseY } = this.getMouseGamePosition(rawX, rawY);

    const item = this.map.getItem(mouseX, mouseY);

    if (item == null) {
      if (this.getSelectedMapItems().every(entity => entity.type === 'ship')) {
        // Try to move to that location.
        const targetLocation = { x: mouseX, y: mouseY };
        // Move to an empty place

        this.getSelectedMapItems().forEach(ship => sendMessage({ type: 'MoveShip', shipId: ship.id, targetLocation }));
      }
    } else {
      if ((item.type === 'ship' || item.type === 'shipyard' || item.type === 'mine' || item.type === 'fort' || item.type === 'buildingTemplate') && this.getSelectedMapItems().every(entity => entity.type === 'ship')
        && item.team !== this.team) {
        // Trying to attack something
        this.getSelectedMapItems().forEach(ship => sendMessage({ type: 'AttackShip', id: ship.id, targetId: item.id }));
      }
    }
  }

  mousemove(event) {
    const { rawX, rawY } = this.getRawMouseCords(event);
    this.hoveredCoords = { x: rawX, y: rawY };
  }

  getRawMouseCords(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      rawX: event.clientX - rect.left,
      rawY: event.clientY - rect.top,
    };
  }

  procesGuiRightMouseClick(rawX, rawY, sendMessage) {
    // In the gui
    const item = this.gui.getItem(rawX, rawY);

    if (this.gui.displayMode === 'designer') {
      // Right clicks in the designer do nothing.
      return;
    }

    if (item == null) {
      return;
    }

    switch (item.getType()) {
      case 'shiptemplate':
        this.getSelectedMapItems().forEach(shipyard =>
          sendMessage({ type: 'CancelShip', templateNumber: item.templateNum, shipyardId: shipyard.id })
        );
        break;

      default:
    }
  }

  processGuiLeftMouseClick(rawX, rawY, sendMessage) {
    // In the gui
    const item = this.gui.getItem(rawX, rawY);

    if (this.gui.displayMode === 'designer') {
      this.gui.designerSelection(item);
    } else {
      if (rawX >= this.width - 150 && rawX < this.width - 50 && rawY >= 50 && rawY < 150) {
        // You are in the mini map;
        const x = (rawX - (this.width - 150)) * this.map.width * 50 / 100;
        const y = (rawY - 50) * this.map.height * 50 / 100;
        this.centerAround(x, y);
        return;
      }

      if (item == null) {
        return;
      }

      switch (item.getType()) {
        case 'shipbuilder':
          this.gui.displayMode = 'designer';
          break;
        case 'shiptemplate':
          const template = templates[item.templateNum];
          this.getSelectedMapItems().forEach(shipyard =>
            sendMessage({ type: 'MakeShip', templateNumber: item.templateNum, shipyardId: shipyard.id, template })
          );
          break;
        case 'hull':
          sendMessage({ type: 'UpdateMode', targetMode: 'hardpoints' });
          break;
        case 'hardpoints':
          sendMessage({ type: 'UpdateMode', targetMode: 'hull' });
          break;

        case 'mine':
        case 'fort':
        case 'shipyard':
        case 'recycle':
          this.updateSelectionState({ ...this.selectionState, gui: { type: item.getType(), templateNum: item.getTemplateNum() } });
          break;

        default:

      }
    }
  }

  getSelectedMapItems() {
    return this.selectionState.map.map(id => this.map.getEntity(id)).filter(item => item != null);
  }

  isDragAction(mouseX, mouseY) {
    if (this.hoveredCoords == null) {
      return false;
    }

    if (this.hoveredCoords.x >= this.width - GUI_WIDTH) {
      return false;
    }

    const hoverGameCoords = this.getMouseGamePosition(this.hoveredCoords.x, this.hoveredCoords.y);

    if (this.mouseDownGamePosition == null ||
      this.mouseDownGamePosition.mouseX === mouseX ||
      this.mouseDownGamePosition.mouseY === mouseY) {
      return false;
    }

    if (
      hoverGameCoords.mouseX < this.mouseDownGamePosition.mouseX ||
      hoverGameCoords.mouseY < this.mouseDownGamePosition.mouseY) {
      return false;
    }

    return true;
  }

  processMapLeftMouseClick(rawX, rawY, sendMessage) {
    const x = rawX + this.x - 25;
    const y = rawY + this.y - 25;

    // The mouse coordinates in grid coordinatess.
    let mouseX = x / (50);
    let mouseY = y / (50);

    const mouseRoundedX = Math.round(mouseX);
    const mouseRoundedY = Math.round(mouseY);

    let item = this.map.getItem(mouseX, mouseY);

    if (this.selectionState.gui != null) {
      // The gui stuff always has priority.
      // If an empty tile on an island is selected then add a building
      if (this.selectionState.gui.type === 'mine' || this.selectionState.gui.type === 'shipyard' || this.selectionState.gui.type === 'fort') {
        const buildingType = this.selectionState.gui.type;
        sendMessage({ type: 'MakeBuilding', building: buildingType, x: mouseRoundedX, y: mouseRoundedY });
        this.updateSelectionState({ ...this.selectionState, gui: null });
      } else if (this.selectionState.gui.type === 'recycle' && item != null) {
        if (item.type === 'mine' || item.type === 'shipyard' || item.type === 'fort' || item.type === 'buildingTemplate') {
          sendMessage({ type: 'RecycleBuilding', buildingId: item.id });
          this.updateSelectionState({ ...this.selectionState, gui: null });
        }
      }
    } else if (this.isDragAction(mouseX, mouseY)) {
      // Perform a drag select.
      const hoverGameCoords = this.getMouseGamePosition(this.hoveredCoords.x, this.hoveredCoords.y);

      const items = this.map.getItemsWithinRectangle(this.mouseDownGamePosition.mouseX, this.mouseDownGamePosition.mouseY, hoverGameCoords.mouseX, hoverGameCoords.mouseY);

      this.updateSelectionState({ ...this.selectionState, map: items });
    } else if (item != null) {
      // Select
      this.updateSelectionState({ ...this.selectionState, map: [item.id] });
    } else {
      // Deselect
      this.updateSelectionState({ ...this.selectionState, map: [] });
    }
  }

  /**
   * Render the game. Also performs updates if necessary.
   */
  render(mainProgram, visibleProgram, fogProgram, mapProgram, foggedMapProgram) {
    visibleProgram.setup();

    this.renderList.reset();

    this.context.clearColor(0.0, 0.0, 0.0, 1.0);
    this.context.clear(this.context.COLOR_BUFFER_BIT);

    this.renderList.translate(25, 25);
    this.map.renderVisibilityMask(this.renderList, this.team, true);
    this.renderList.translate(-25, -25);

    this.renderList.render(this.context);


    fogProgram.setup();

    this.renderList.reset();

    this.renderList.translate(25, 25);
    this.map.renderVisibilityMask(this.renderList, this.team);
    this.renderList.translate(-25, -25);

    this.renderList.render(this.context);


    foggedMapProgram.setup(-this.x, -this.y);

    this.renderList.reset();

    this.context.clearColor(0.0, 0.0, 0.0, 1.0);
    this.context.clear(this.context.COLOR_BUFFER_BIT);

    this.renderList.translate(25, 25);
    this.map.renderMainMapFogged(this.renderList);
    this.renderList.translate(-25, -25);

    this.renderList.render(this.context);


    mapProgram.setup(-this.x, -this.y);

    this.renderList.reset();

    this.renderList.translate(25, 25);
    this.map.renderMainMap(this.renderList, this.selectionState);
    this.renderList.translate(-25, -25);

    this.renderList.render(this.context);


    mainProgram.setup();

    this.renderList.reset();

    this.renderList.translate(25, 25);

    this.renderList.translate(-this.x, -this.y);

    if (this.hoveredCoords && this.hoveredCoords.x < this.width - GUI_WIDTH && this.selectionState.gui == null) {
      if (this.mouseDownGamePosition != null) {
        const hoverGameCoords = this.getMouseGamePosition(this.hoveredCoords.x, this.hoveredCoords.y);

        const dx = hoverGameCoords.mouseX - this.mouseDownGamePosition.mouseX;
        const dy = hoverGameCoords.mouseY - this.mouseDownGamePosition.mouseY;

        if (dx > 0 && dy > 0) {
          this.renderList.strokeRect('white', 2, this.mouseDownGamePosition.mouseX * 50, this.mouseDownGamePosition.mouseY * 50, dx * 50, dy * 50);
        }
      }
    }

    this.renderList.translate(this.x, this.y);
    this.renderList.translate(-25, -25);

    if (this.hoveredCoords && this.hoveredCoords.x >= this.width - GUI_WIDTH) {
      this.gui.render(this.renderList, this.map, this.hoveredCoords);
    } else {
      this.gui.render(this.renderList, this.map, null);
    }

    this.renderList.render(this.context);


    if (this.gui.displayMode === 'main') {
      const scale = this.map.width / 2;

      foggedMapProgram.setup(this.width - 150, 50, 1 / scale);
      this.renderList.reset();

      this.renderList.translate(25, 25);
      this.map.renderMainMapFogged(this.renderList, 5, this.map.width / 3);
      this.renderList.translate(-25, -25);

      this.renderList.render(this.context);


      mapProgram.setup(this.width - 150, 50, 1 / scale);
      this.renderList.reset();

      this.renderList.translate(25, 25);
      this.map.renderMainMap(this.renderList, this.selectionState, 5, this.map.width / 3);
      this.renderList.translate(-25, -25);

      this.renderList.render(this.context);

      mainProgram.setup();
      this.renderList.reset();

      this.renderList.translate(this.width - 150, 50);
      this.renderList.scale(1 / scale);

      this.renderList.translate(25, 25);
      this.map.renderMiniMapFrame(this.renderList, this.x, this.y, this.width - GUI_WIDTH, this.height);

      this.renderList.render(this.context);
    }
  }

  keydown(event) {
    this.pressedKeys.add(event.keyCode);
  }

  keyup(event) {
    this.pressedKeys.delete(event.keyCode);
  }
}

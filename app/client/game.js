import Gui from '../shared/gui';
import { GUI_WIDTH } from '../shared/gui';
import { createSource } from './audio';

import { defaultTemplate, getStats } from '../shared/template';

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
      ['A'.charCodeAt(0)]: () => this.moveGame(-1, 0),
      38: () => this.moveGame(0, -1),
      ['W'.charCodeAt(0)]: () => this.moveGame(0, -1),
      39: () => this.moveGame(1, 0),
      ['D'.charCodeAt(0)]: () => this.moveGame(1, 0),
      40: () => this.moveGame(0, 1),
      ['S'.charCodeAt(0)]: () => this.moveGame(0, 1),
    };

    this.pressedKeys = new Set();

    this.renderList = new RenderList(this.images.pixelJson);

    this.controlGroups = {};
    for (let i = 0; i <= 9; i ++) {
      this.controlGroups[i] = [];
    }

    this.infiniteProduce = null
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
    } else {
      this.mouseDownGamePosition = null;
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
    this.rightClickMapHelper(mouseX, mouseY, sendMessage);

  }

  rightClickMapHelper(mouseX, mouseY, sendMessage) {
    const item = this.map.getItem(mouseX, mouseY);

    if (item == null) {
      if (this.getSelectedMapItems().every(entity => entity.type === 'ship')) {
        // Try to move to that location.
        const targetLocation = { x: mouseX, y: mouseY };
        // Move to an empty place

        this.getSelectedMapItems().forEach(ship => sendMessage({ type: 'MoveShip', shipId: ship.id, targetLocation }));
      }
    } else {
      if (item.health != null && this.getSelectedMapItems().every(entity => entity.type === 'ship')
        && item.team !== this.team) {
        // Trying to attack something
        this.getSelectedMapItems().forEach(ship => sendMessage({ type: 'AttackShip', id: ship.id, targetId: item.id }));
      }
    }
  }

  mousemove(event) {
    const { rawX, rawY } = this.getRawMouseCords(event);
    this.hoveredCoords = { x: rawX, y: rawY };

    if (rawX > this.width - GUI_WIDTH) {
      // I am now entering the gui.
      // Try to discard selection if possible.

      if (this.mouseDownGamePosition != null) {
        this.performDrag(this.hoveredCoords);
      }

      this.mouseDownRawPosition = null;
      this.mouseDownGamePosition = null;
    }
  }

  mouseout(event) {
    const { rawX, rawY } = this.getRawMouseCords(event);
    const coords = { x: rawX, y: rawY };
    if (this.mouseDownGamePosition != null) {
      this.performDrag(coords);
    }

    this.mouseDownRawPosition = null;
    this.mouseDownGamePosition = null;
  }

  getRawMouseCords(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      rawX: event.clientX - rect.left - 5,
      rawY: event.clientY - rect.top - 5,
    };
  }

  procesGuiRightMouseClick(rawX, rawY, sendMessage) {
    // In the gui
    const item = this.gui.getItem(rawX, rawY);

    if (this.gui.displayMode === 'designer') {
      // Right clicks in the designer do nothing.
      return;
    }

    if (rawX >= this.width - 150 && rawX < this.width - 50 && rawY >= 50 && rawY < 150) {
      // You are in the mini map;
      const x = (rawX - (this.width - 150)) * this.map.width/ 100;
      const y = (rawY - 50) * this.map.height / 100;
      this.rightClickMapHelper(x, y, sendMessage);
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
        case 'infinity':
        case 'infinitySelected':
          const templateinf = templates[item.templateNum];

          this.getSelectedMapItems().forEach(shipyard =>
            this.gui.selectTemplate({ templateNumber: item.templateNum, shipyardId: shipyard.id, template: templateinf })
          );

          this.getSelectedMapItems().forEach(shipyard =>
            sendMessage({ type: 'SetInfProduce', infproduce: { templateNumber: item.templateNum, shipyardId: shipyard.id, template: templateinf } })
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

    if (this.mouseDownGamePosition == null ||
      this.mouseDownGamePosition.mouseX === mouseX ||
      this.mouseDownGamePosition.mouseY === mouseY) {
      return false;
    }

    return true;
  }

  performDrag(coords) {
    // Perform a drag select.
    const hoverGameCoords = this.getMouseGamePosition(coords.x, coords.y);

    const leftX = Math.min(this.mouseDownGamePosition.mouseX, hoverGameCoords.mouseX);
    const rightX = Math.max(this.mouseDownGamePosition.mouseX, hoverGameCoords.mouseX);

    const leftY = Math.min(this.mouseDownGamePosition.mouseY, hoverGameCoords.mouseY);
    const rightY = Math.max(this.mouseDownGamePosition.mouseY, hoverGameCoords.mouseY);

    let items = this.map.getItemsWithinRectangle(leftX, leftY, rightX, rightY);

    const ships = items.filter((id) => this.map.getEntity(id).type === 'ship');
    const shipyards = items.filter((id) => this.map.getEntity(id).type === 'shipyard');

    if (ships.length > 0) {
      items = ships;
    } else {
      items = shipyards;
    }

    if (this.pressedKeys.has(16)) {
      // Shift key, so concat the items
      items = this.selectionState.map.concat(items);
    } else if (this.pressedKeys.has(17)) {
      // Control key, so filter the current selection
      items = this.selectionState.map.filter((oldItem) => items.indexOf(oldItem) === -1);
    }

    this.updateSelectionState({ ...this.selectionState, map: items });
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

    if (this.mouseDownRawPosition == null) {
      // Must have been off screen.
      return;
    }

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
      this.performDrag(this.hoveredCoords);
    } else if (item != null) {
      let items = [item.id];
      if (this.pressedKeys.has(16)) {
        // Shift key, so concat the items
        items = this.selectionState.map.concat(items);
      } else if (this.pressedKeys.has(17)) {
        // Control key, so filter the current selection
        items = this.selectionState.map.filter((oldItem) => oldItem !== item.id);
      }
      this.updateSelectionState({ ...this.selectionState, map: items });
    } else {
      // Deselect
      this.updateSelectionState({ ...this.selectionState, map: [] });
    }
  }

  /**
   * Render the game. Also performs updates if necessary.
   */
  render(mainProgram, visibleProgram, fogProgram, mapProgram, foggedMapProgram, sendMessage) {
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

        this.renderList.strokeRect('white', 2, this.mouseDownGamePosition.mouseX * 50, this.mouseDownGamePosition.mouseY * 50, dx * 50, dy * 50);
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

      this.map.renderMiniMapFrame(this.renderList, this.x, this.y, this.width - GUI_WIDTH, this.height);

      this.renderList.render(this.context);
    }
  }

  keydown(event) {
    if (event.keyCode >= '0'.charCodeAt(0) && event.keyCode <= '9'.charCodeAt(0)) {
      // A number key has been pressed I need to bind this to a control group, or select that group.

      if (this.pressedKeys.has(17)) {
        // Control key so create a group
        this.controlGroups[event.keyCode - 48] = this.selectionState.map;
        event.preventDefault();
      } else {
        // No control key, so switch to group
        this.updateSelectionState({ ...this.selectionState, map: this.controlGroups[event.keyCode - 48] });
      }
    } else if (event.keyCode == 'A'.charCodeAt(0) && this.pressedKeys.has(17)) {
      const ships = this.map.getShips().filter((ship) => ship.team === this.team).map((ship) => ship.id);
      this.updateSelectionState({ ...this.selectionState, map: ships});
    }

    this.pressedKeys.add(event.keyCode);
  }

  keyup(event) {
    this.pressedKeys.delete(event.keyCode);
  }

  clearkeydowns() {
    this.pressedKeys.clear();
  }
}

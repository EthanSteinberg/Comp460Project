import { MAP_WIDTH } from './gamemap';
import { MAP_HEIGHT } from './gamemap';

/**
 * An island entity.
 */

export default class Island {

  constructor(map, coordinates, team) {
    this.map = map;
    this.coordinates = coordinates;
    this.id = map.getNextEntityId();
    this.team = team;

    this.perimeter = [];
    for (const [iX, iY] of this.coordinates) {
      this.addToPerimeter(iX-1, iY-1);
      this.addToPerimeter(iX, iY-1);
      this.addToPerimeter(iX+1, iY-1);
      this.addToPerimeter(iX-1, iY);
      this.addToPerimeter(iX+1, iY);
      this.addToPerimeter(iX-1, iY+1);
      this.addToPerimeter(iX, iY+1);
      this.addToPerimeter(iX+1, iY+1);
    }
  }

  addToPerimeter(x, y) {
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && this.isIsland(x,y) == false) {
      this.perimeter.push([x,y]);
    }
  }

  render(context) {
    for (const [x, y] of this.coordinates) {
      context.fillStyle = 'green';
      context.fillRect((x - 0.5) * 50, (y - 0.5) * 50, 50, 50);
    }
  }

  isIsland(x, y) {
    for (const [iX, iY] of this.coordinates) {
      if (x === iX && y === iY) {
        return true;
      }
    }
    return false;
  }

  isNextToIsland(x, y) {
    for (const [iX, iY] of this.perimeter) {
      if (x === iX && y === iY) {
        return true;
      }
    }
    return false;
  }

  getId() {
    return this.id;
  }

}

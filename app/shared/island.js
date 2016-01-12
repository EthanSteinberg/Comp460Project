/**
 * An island entity.
 */
let nextId = 0;

export default class Island {

  constructor(map, coordinates) {
    this.map = map;
    this.coordinates = coordinates;
    this.id = nextId++;
  }

  render(context) {
    for (const [x, y] of this.coordinates) {
      context.fillStyle = 'green';
      context.fillRect(x * 50, y * 50, 50, 50);
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

  getIsland(x, y) {
    for (const [iX, iY] of this.coordinates) {
      if (x === iX && y === iY) {
        return this.id;
      }
    }
    return -1;
  }

  getId() {
    return this.id;
  }

}

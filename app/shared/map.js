/**
  * @flow
  */

export default class Map {

  constructor() {
    this.islands = [
      [1,1],
      [3,2], 
    ];
  }

  render(context) {
    for (const [x,y] of this.islands) {
      context.fillStyle = 'green';
      context.fillRect(x*50, y *50, 50, 50);
    }
  }
}

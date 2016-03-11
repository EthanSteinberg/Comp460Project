import GameMap from './gamemap';
import * as Ships from './ship';
import * as Islands from './island';

const maps = [
  {
    width: 20,
    height: 20,
    ships: [
      {
        team: '0',
        x: 0,
        y: 3,
      },
      {
        team: '1',
        x: 17,
        y: 17,
      },
    ],
    islands: [
      [
        [1, 1],
        [1, 2],
      ],
      [
        [18, 17],
        [18, 18],
      ],
      [
        [17, 3],
      ],
      [
        [3, 17],
      ],
    ],
  },
  {
    width: 20,
    height: 20,
    ships: [
      {
        team: '0',
        x: 0,
        y: 3,
      },
      {
        team: '1',
        x: 16,
        y: 17,
      },
    ],
    islands: [
      [
        [1, 1],
        [1, 2],
        [2, 1],
        [2, 2],
      ],
      [
        [17, 17],
        [17, 18],
        [18, 17],
        [18, 18],
      ],
      [
        [17, 3],
      ],
      [
        [3, 17],
      ],
      [
        [10, 10],
        [10, 11],
        [11, 10],
        [11, 11],
      ],
    ],
  },
  {
    width: 40,
    height: 40,
    ships: [
      {
        team: '0',
        x: 0,
        y: 3,
      },
      {
        team: '1',
        x: 16,
        y: 17,
      },
    ],
    islands: [
      [
        [1, 1],
        [1, 2],
        [2, 1],
        [2, 2],
      ],
      [
        [17, 17],
        [17, 18],
        [18, 17],
        [18, 18],
      ],
      [
        [17, 3],
      ],
      [
        [3, 17],
      ],
      [
        [9, 9],
        [9, 10],
        [10, 9],
        [10, 10],
      ],
      [
        [5, 5],
      ],
      [
        [13, 13],
      ],
    ],
  },
];

const template = {
  hull: 'gunboat',
  hardpoints: ['roundshot'],
};

export function createMap(mapNum) {
  const { ships, width, height, islands } = maps[mapNum];

  const map = new GameMap({
    entries: [],
    width,
    height,
  });

  map.addEntity({
    id: '0',
    type: 'playerstate',
    coins: 50,
    targetMode: 'hull',
    numItems: 0,
  });

  map.addEntity({
    id: '1',
    type: 'playerstate',
    coins: 50,
    targetMode: 'hull',
    numItems: 0,
  });

  for (const { team, x, y } of ships) {
    Ships.createShipAndHardpoints(map, x, y, template, team);
  }

  for (const island of islands) {
    Islands.createIsland(map, island);
  }

  return map;
}

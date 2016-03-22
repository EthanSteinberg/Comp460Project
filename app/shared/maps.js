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
      {
        topLeft: [1, 1],
        size: [1, 2],
      },
      {
        topLeft: [18, 17],
        size: [1, 2],
      },
      {
        topLeft: [17, 3],
        size: [1, 1],
      },
      {
        topLeft: [3, 17],
        size: [1, 1],
      },
    ],
  },
  {
    width: 30,
    height: 30,
    ships: [
      {
        team: '0',
        x: 1,
        y: 3,
      },
      {
        team: '0',
        x: 27,
        y: 26,
      },
      {
        team: '1',
        x: 16,
        y: 16,
      },
    ],
    islands: [
      {
        topLeft: [1, 1],
        size: [2, 2],
      },
      {
        topLeft: [13, 14],
        size: [4, 2],
      },
      {
        topLeft: [27, 27],
        size: [2, 2],
      },
      {
        topLeft: [9, 9],
        size: [1, 1],
      },
      {
        topLeft: [20, 20],
        size: [1, 1],
      },
      {
        topLeft: [27, 1],
        size: [2, 1],
      },
      {
        topLeft: [1, 27],
        size: [1, 2],
      },
    ],
  },
  {
    width: 40,
    height: 40,
    ships: [
      {
        team: '0',
        x: 2,
        y: 3,
      },
      {
        team: '1',
        x: 37,
        y: 36,
      },
    ],
    islands: [
      {
        topLeft: [1, 1],
        size: [1, 2],
      },
      {
        topLeft: [19, 19],
        size: [2, 2],
      },
      {
        topLeft: [10, 10],
        size: [1, 1],
      },
      {
        topLeft: [29, 29],
        size: [1, 1],
      },
      {
        topLeft: [10, 29],
        size: [1, 1],
      },
      {
        topLeft: [29, 10],
        size: [1, 1],
      },
      {
        topLeft: [1, 38],
        size: [2, 1],
      },
      {
        topLeft: [38, 1],
        size: [1, 2],
      },
      {
        topLeft: [38, 37],
        size: [1, 2],
      },
    ],
  },
  {
    width: 30,
    height: 30,
    ships: [
      {
        team: '0',
        x: 1,
        y: 3,
      },
      {
        team: '1',
        x: 27,
        y: 26,
      },
    ],
    islands: [
      {
        topLeft: [1, 1],
        size: [1, 2],
      },
      {
        topLeft: [27, 27],
        size: [1, 2],
      },
    ],
  },
];

const template = {
  hull: 'gunboat',
  hardpoints: ['roundshot'],
};

function canPlace(map, xPosition, yPosition, islandWidth, islandHeight) {
  for (let dx = 0; dx < islandWidth; dx++) {
    for (let dy = 0; dy < islandHeight; dy++) {
      if (dx + xPosition >= map.width || dy + yPosition >= map.height) {
        return false;
      }

      if (map.getItem(dx + xPosition, dy + yPosition) != null) {
        return false;
      }
    }
  }

  return true;
}

function addRandomIsland(map, islandWidth, islandHeight) {
  for (;;) {
    // Keep on trying to add an island
    const xPosition = Math.floor(Math.random() * map.width);
    const yPosition = Math.floor(Math.random() * map.height);

    if (canPlace(map, xPosition, yPosition, islandWidth, islandHeight)) {
      Islands.createIsland(map, [xPosition, yPosition], [islandWidth, islandHeight]);
      return;
    }
  }
}

export function createMap(mapNum, fullCreation) {
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
    Islands.createIsland(map, island.topLeft, island.size);
  }

  if (mapNum === 3 && fullCreation) {
    // Add random island
    for (let i = 0; i < 8; i++) {
      addRandomIsland(map, 1, 1);
    }

    for (let i = 0; i < 2; i++) {
      addRandomIsland(map, 2, 1);
    }

    for (let i = 0; i < 2; i++) {
      addRandomIsland(map, 1, 2);
    }

    addRandomIsland(map, 2, 2);
  }

  return map;
}

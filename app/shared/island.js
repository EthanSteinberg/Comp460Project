/**
 * An island entity.
 */

function addToPerimeter(island, x, y, map) {
  if (x >= 0 && x < map.width && y >= 0 && y < map.height && !isIsland(island, x, y)) {
    for (const [oldX, oldY] of island.perimeter) {
      if (oldX === x && oldY === y) {
        return;
      }
    }
    island.perimeter.push([x, y]);
  }
}

export function createIsland(map, coordinates) {
  const island = {
    coordinates,
    id: map.getNextEntityId(),
    team: null,
    perimeter: [],
    type: 'island',
  };

  for (const [iX, iY] of island.coordinates) {
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        addToPerimeter(island, iX + dx, iY + dy, map);
      }
    }
  }

  map.addEntity(island);

  return island.id;
}

export function render(island, map, context, images) {
  // for (const [x, y] of island.coordinates) {
  //   // context.fillStyle = 'green';
  //   // context.fillRect((x - 0.5) * 50, (y - 0.5) * 50, 50, 50);
  //   context.drawImage(images.island, (x - 0.5) * 50, (y - 0.5) * 50, 50, 50);
  // }

  var coords = island.coordinates[0]
  var x = coords[0]
  var y = coords[1]

  if (island.coordinates.length == 1) {
    context.drawImage(images.island, (x - 0.5) * 50, (y - 0.5) * 50, 50, 50);
  } else if (island.coordinates.length == 2) {
    context.drawImage(images.island, (x - 0.5) * 50, (y - 0.5) * 50, 50, 100);
  } else if (island.coordinates.length == 4) {
    context.drawImage(images.island, (x - 0.5) * 50, (y - 0.5) * 50, 100, 100);
  }

  const [mainX, mainY] = island.coordinates[0];

  if (island.team != null) {
    const flag = (island.team === '0') ? images.blueFlag : images.redFlag;

    const scale = 20;
    context.drawImage(flag, (mainX + 0.3) * 50, (mainY - 0.9) * 50, 480 / scale, 670 / scale);
  }
}

export function isIsland(island, x, y) {
  for (const [iX, iY] of island.coordinates) {
    if (x === iX && y === iY) {
      return true;
    }
  }
  return false;
}

export function isNextToIsland(island, x, y) {
  for (const [iX, iY] of island.perimeter) {
    if (x === iX && y === iY) {
      return true;
    }
  }
  return false;
}

function getOwningTeam(island, map) {
  // First scan for buildings on this island
  for (const entity of map.entities.values()) {
    if (entity.type === 'shipyard' || entity.type === 'mine') {
      for (const [iX, iY] of island.coordinates) {
        if (entity.x === iX && entity.y === iY) {
          return entity.team;
        }
      }
    }
  }

  // Then scan for ships. Note that we get all teams as we need to make sure
  // that all surrounding ships are the right team.
  const shipTeams = [];
  for (const entity of map.entities.values()) {
    if (entity.type === 'ship') {
      for (const [iX, iY] of island.perimeter) {
        if (Math.round(entity.x) === iX && Math.round(entity.y) === iY) {
          shipTeams.push(entity.team);
        }
      }
    }
  }

  if (shipTeams.length > 0) {
    const firstTeam = shipTeams[0];

    if (shipTeams.every(team => team === firstTeam)) {
      return firstTeam;
    }
  }

  return null;
}

export function processUpdate(island, map) {
  island.team = getOwningTeam(island, map);
}

import buildingConstants from './buildingconstants';

/**
 * A shipyard entity.
 */

export function createShipyard(map, x, y, islandID, team) {
  const shipyard = {
    map,
    x,
    y,
    islandID,
    health: 100,
    team,
    id: map.getNextEntityId(),
    set: true,
    type: 'shipyard',
  };

  map.addEntity(shipyard);

  return shipyard.id;
}

export function render(shipyard, map, context, images, isSelected) {
  if (shipyard.team === '1') {
    context.fillStyle = 'firebrick';
  } else {
    context.fillStyle = 'royalblue';
  }

  context.beginPath();
  context.arc(shipyard.x * 50, shipyard.y * 50, 25, 0, Math.PI * 2, true);
  context.fill();

  context.drawImage(images.shipyard, (shipyard.x - 0.5) * 50, (shipyard.y - 0.5) * 50, 50, 50);

  context.fillStyle = 'red';
  context.fillRect(shipyard.x * 50 - 20, shipyard.y * 50 + 30, 40, 5);

  const healthpercent = shipyard.health / 100;

  context.fillStyle = 'green';
  context.fillRect(shipyard.x * 50 - 20, shipyard.y * 50 + 30, 40 * healthpercent, 5);

  context.strokeStyle = 'black';
  context.strokeRect(shipyard.x * 50 - 20, shipyard.y * 50 + 30, 40, 5);

  if (isSelected) {
    context.strokeStyle = 'cyan';
    context.strokeRect(
      (shipyard.x - 0.5) * 50,
      (shipyard.y - 0.5) * 50,
      50,
      50
    );
  }
}

export function getPosition(shipyard) {
  return { x: shipyard.x, y: shipyard.y };
}

export function processUpdate(shipyard) {
  // Do nothing for now
}

export function remove(shipyard, map) {
  map.removeEntity(shipyard.id);
}

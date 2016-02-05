import buildingConstants from './buildingconstants';

/**
 * A shipyard entity.
 */

export function createShipyard(map, x, y, islandID) {
  const shipyard = {
    map,
    x,
    y,
    islandID,

    id: map.getNextEntityId(),
    set: true,
    type: 'shipyard',
  };

  map.addEntity(shipyard);

  return shipyard.id;
}

export function render(shipyard, map, context, images, isSelected) {
  context.drawImage(images.shipyard, (shipyard.x - 0.5) * 50, (shipyard.y - 0.5) * 50, 50, 50);

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

export function processUpdate(shipyard, map) {
  // Do nothing for now
}

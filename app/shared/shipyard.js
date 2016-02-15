import * as Ships from './ship';
import { getStats } from '../shared/template';

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
    buildingQueue: [],
    progressTowardsNextBuild: 0,
    counters: { 0: 0, 1: 0, 2: 0 },
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

export function processUpdate(shipyard, map) {
  if (shipyard.buildingQueue.length > 0) {
    shipyard.progressTowardsNextBuild += 1;

    if (shipyard.progressTowardsNextBuild === 100) {
      const { template, templateNumber } = shipyard.buildingQueue.shift();
      shipyard.counters[templateNumber]--;
      const stats = getStats(template);

      const { x, y } = map.getShipBuildCoords(shipyard.islandID);

      if (x == null) {
        console.error('No space available to build ship.');
        map.getEntity(shipyard.team).coins += stats.wcost;
      } else {
        Ships.createShipAndHardpoints(map, x, y, template, shipyard.team);
      }

      shipyard.progressTowardsNextBuild = 0;
    }
  }
}

export function remove(shipyard, map) {
  map.removeEntity(shipyard.id);
}

export function addTemplateToQueue(shipyard, templateNumber, template) {
  shipyard.counters[templateNumber]++;
  shipyard.buildingQueue.push({ template, templateNumber });
}

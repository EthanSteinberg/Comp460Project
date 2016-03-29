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
    renderHeal: false,
    healTimer: 2,
  };

  map.addEntity(shipyard);

  return shipyard.id;
}

export function render(shipyard, map, renderList, isSelected) {
  if (isSelected) {
    renderList.addImage('shipSelect', (-1 + shipyard.x) * 50, (-1 + shipyard.y) * 50, 2 * 50, 2 * 50);
  }

  const name = (shipyard.team === '1') ? 'pirateCircle' : 'imperialCircle';

  renderList.addImage(name, shipyard.x * 50 - 25, shipyard.y * 50 - 25);

  renderList.addImage('shipyard2', (shipyard.x - 0.5) * 50, (shipyard.y - 0.5) * 50, 50, 50);

  renderList.addImage('black', shipyard.x * 50 - 22, shipyard.y * 50 + 28, 44, 9);

  renderList.addImage('red', shipyard.x * 50 - 20, shipyard.y * 50 + 30, 40, 5);

  const healthpercent = shipyard.health / 100;

  renderList.addImage('green', shipyard.x * 50 - 20, shipyard.y * 50 + 30, 40 * healthpercent, 5);

  if (shipyard.renderHeal) {
    var randomX = Math.floor(Math.random()*(50 - (-5) + 1) + -5);
    var randomY = Math.floor(Math.random()*(50 - (-5) + 1) + -5);
    renderList.addImage('cross', (shipyard.x - 0.5) * 50 + randomX , (shipyard.y - 0.5) * 50 + randomY, 10, 10);
  }
}

export function getPosition(shipyard) {
  return { x: shipyard.x, y: shipyard.y };
}

export function heal(shipyard, map) {
  if (shipyard.healTimer > 0) {
    shipyard.healTimer -= 1
    return;
  } else {
    shipyard.healTimer = 2
  }

  if (shipyard.health < 100) {
    shipyard.health += 5
    shipyard.renderHeal = true
  } else {
    shipyard.renderHeal = false;
  }
}

export function processUpdate(shipyard, map) {
  if (shipyard.buildingQueue.length > 0) {
    shipyard.progressTowardsNextBuild += 1;

    const { template, templateNumber } = shipyard.buildingQueue[0];
    const stats = getStats(template);


    if (shipyard.progressTowardsNextBuild === stats.tcost) {
      shipyard.buildingQueue.shift();
      shipyard.counters[templateNumber]--;

      const { x, y } = map.getShipBuildCoords(shipyard.islandID);

      if (x == null) {
        console.error('No space available to build ship.');
        map.getEntity(shipyard.team).coins += stats.cost;
      } else {
        Ships.createShipAndHardpoints(map, x, y, template, shipyard.team);
      }

      shipyard.progressTowardsNextBuild = 0;
    }
  }
}

export function remove(shipyard, map) {
  map.removeEntity(shipyard.id);

  // Refund in progress ships
  for (const { template } of shipyard.buildingQueue) {
    const stats = getStats(template);
    map.getEntity(shipyard.team).coins += stats.cost;
  }
}

export function addTemplateToQueue(shipyard, templateNumber, template) {
  shipyard.counters[templateNumber]++;
  shipyard.buildingQueue.push({ template, templateNumber });
}

export function removeTemplateFromQueue(shipyard, map, templateNumber) {
  if (shipyard.counters[templateNumber] === 0) {
    return;
  }

  shipyard.counters[templateNumber]--;
  let optionIndex = null;
  for (let i = 0; i < shipyard.buildingQueue.length; i++) {
    if (shipyard.buildingQueue[i].templateNumber === templateNumber) {
      optionIndex = i;
    }
  }

  if (optionIndex == null) {
    console.error('Trying to remove non-existant item from the queue? What?');
  }

  const [removed] = shipyard.buildingQueue.splice(optionIndex, 1);

  const stats = getStats(removed.template);
  map.getEntity(shipyard.team).coins += stats.cost;
}

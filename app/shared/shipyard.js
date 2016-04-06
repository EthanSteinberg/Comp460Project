import * as Ships from './ship';
import { getStats } from '../shared/template';
import * as Health from './health';

/**
 * A shipyard entity.
 */

export function createShipyard(map, x, y, islandID, team) {
  const id = map.getNextEntityId();
  const shipyard = {
    map,
    x,
    y,
    islandID,
    health: Health.createHealth(100, id),
    team,
    id,
    set: true,
    type: 'shipyard',
    buildingQueue: [],
    progressTowardsNextBuild: 0,
    counters: { 0: 0, 1: 0, 2: 0 },
    renderHeal: false,
    healTimer: 2,
    maxCoinFlow: 0,
    infiniteProduce: null,
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

  if (shipyard.health.health < 100) {
    shipyard.health.health += 5
    shipyard.renderHeal = true
  } else {
    shipyard.renderHeal = false;
  }
}

export function setInfiniteProduce(shipyard, newInfProduce) {
  if (shipyard.infiniteProduce == null) {
    shipyard.infiniteProduce = newInfProduce
  } else if (shipyard.infiniteProduce.templateNumber == newInfProduce.templateNumber) {
    shipyard.infiniteProduce = null
  } else {
    shipyard.infiniteProduce = newInfProduce
  }
}

export function processUpdate(shipyard, map) {
  if (shipyard.buildingQueue.length > 0) {

    const { template, templateNumber } = shipyard.buildingQueue[0];
    const stats = getStats(template);

    if (map.getMaxCoinFlow() > map.getEntity(shipyard.team).coins) {
      var cost = map.getEntity(shipyard.team).coins / map.getBuildQueue().length;
      shipyard.progressTowardsNextBuild += cost
      map.getEntity(shipyard.team).coins -= cost;
    } else {
      var cost = stats.maxCoinFlow; 
      shipyard.progressTowardsNextBuild += cost;
      map.getEntity(shipyard.team).coins -= cost;
    }

    if (shipyard.progressTowardsNextBuild >= stats.cost) {
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
      map.removeEntityFromQueue(stats)    
    }
  } else {
    if (shipyard.infiniteProduce) {
      const info = shipyard.infiniteProduce
      const stats = getStats(info.template);

      addTemplateToQueue(shipyard, info.templateNumber, info.template);
      map.addEntityToQueue(stats)
    } 
  }
}

export function remove(shipyard, map) {
  map.removeEntity(shipyard.id);

  // Refund in progress ships
  for (const { template } of shipyard.buildingQueue) {
    const stats = getStats(template);
    map.getEntity(shipyard.team).coins += shipyard.progressTowardsNextBuild;
  }
}

export function addTemplateToQueue(shipyard, templateNumber, template) {
  shipyard.counters[templateNumber]++;
  shipyard.buildingQueue.push({ template, templateNumber });
  shipyard.maxCoinFlow += getStats(template).maxCoinFlow
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

  shipyard.maxCoinFlow -= getStats(removed.template).maxCoinFlow
  const stats = getStats(removed.template);
  map.getEntity(shipyard.team).coins += shipyard.progressTowardsNextBuild;
  map.removeEntityFromQueue(stats);
  shipyard.progressTowardsNextBuild = 0;
}

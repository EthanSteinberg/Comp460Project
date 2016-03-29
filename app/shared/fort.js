import { hulls, hardpoints } from './template';
import * as Hardpoints from './hardpoint';
import Types from './types';
import { getDistance } from './vector';
import * as Mine from './mine';
import * as Shipyard from './shipyard';


/**
 * A fort entity.
 */

export function createFort(map, x, y, islandID, team) {
  var fortId = map.getNextEntityId();
  const fort = {
    type: 'fort',
    x,
    y,
    id: fortId,
    islandID,
    team,
    health: 300,
    hardpoints: [Hardpoints.createHardpoint(map, fortId, 0, "shell", team), 
                  Hardpoints.createHardpoint(map, fortId, 1, "roundshot", team)],
  };

  map.addEntity(fort);

  return fort.id;
}

export function processUpdate(fort, map) {
  for (const hardpointId of fort.hardpoints) {
    const hardpoint = map.getEntity(hardpointId);
    if (hardpoint != null) {
      Hardpoints.processUpdate(map.getEntity(hardpointId), map);
    }
  }

  for (const entity of map.entities.values()) {
    if (entity.type != 'mine' && entity.type != 'shipyard') {
      continue;
    }

    if (entity.islandID == fort.islandID) {
      if (entity.type == 'mine') {
        Mine.heal(entity, map)
      } else if (entity.type = 'shipyard') {
        Shipyard.heal(entity, map)
      }
    }
  }


  processIdleAttack(fort, map);
}

export function render(fort, map, renderList, isSelected) {
  const name = (fort.team === '1') ? 'pirateCircle' : 'imperialCircle';

  renderList.addImage(name, fort.x * 50 - 25, fort.y * 50 - 25);

  renderList.addImage('fort', (fort.x - 0.5) * 50, (fort.y - 0.5) * 50, 50, 50);

  renderList.addImage('black', fort.x * 50 - 22, fort.y * 50 + 28, 44, 9);

  renderList.addImage('red', fort.x * 50 - 20, fort.y * 50 + 30, 40, 5);

  const healthpercent = fort.health / 300;

  renderList.addImage('green', fort.x * 50 - 20, fort.y * 50 + 30, 40 * healthpercent, 5);

  if (isSelected) {
    renderList.addImage('cyan',
      (this.x - 0.5) * 50,
      (this.y - 0.5) * 50,
      50,
      50
    );
  }
}

export function getPosition(fort) {
  return { x: fort.x, y: fort.y };
}

export function remove(fort, map) {
  map.removeEntity(fort.id);
  for (const hardpointId of fort.hardpoints) {
    map.removeEntity(hardpointId);
  }
}

/**
 * Tries to shoot at the target (entity is the parent entity).
 * If there are cannons which can fire, but need to be closer, returns true.
 * Returns false if there is no point moving closer.
 */
function shootAt(fort, map, entity, target, rangePenalty) {
  let shouldMoveCloser = false;

  const targetLocation = getPosition(entity, map);
  const distance = getDistanceToTarget(fort, targetLocation);
  for (const hardpointId of fort.hardpoints) {
    const hardpoint = map.getEntity(hardpointId);
    if (hardpoint != null && hardpoint.timeTillNextFire === 0) {
      if (distance < hardpoints[hardpoint.gunType].range - rangePenalty) {
        Hardpoints.fire(hardpoint, map, target);
      } else {
        shouldMoveCloser = true;
      }
    }
  }

  return shouldMoveCloser;
}

/**
 * Shoot at any enemy ships in range with the current attack pattern
 */
function processIdleAttack(fort, map) {
  for (const entity of map.entities.values()) {
    if (entity.type === 'ship' && entity.team !== fort.team) {
      const actualTarget = getActualTarget(fort, map, entity);
      if (actualTarget != null) {
        shootAt(fort, map, entity, actualTarget, 0.5);
      }
    }
  }
}

function getActualTarget(fort, map, target) {
  if (target == null) {
    return null;
  }

  return target;
}

function getDistanceToTarget(fort, target) {
  return getDistance(getPosition(fort), target);
}


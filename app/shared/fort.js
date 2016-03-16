import { hulls, hardpoints } from './template';
import * as Hardpoints from './hardpoint';
import Types from './types';
import { getDistance } from './vector';

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
    health: 200,
    hardpoints: [Hardpoints.createHardpoint(map, fortId, 0, "shell", team)],
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

  processIdleAttack(fort, map);
}

export function render(fort, map, context, images, isSelected) {
  if (fort.team === '1') {
    context.fillStyle = 'firebrick';
  } else {
    context.fillStyle = 'royalblue';
  }

  context.beginPath();
  context.arc(fort.x * 50, fort.y * 50, 25, 0, Math.PI * 2, true);
  context.fill();

  context.fillStyle = 'red';
  context.fillRect(fort.x * 50 - 20, fort.y * 50 + 30, 40, 5);

  const healthpercent = fort.health / 200;

  context.fillStyle = 'green';
  context.fillRect(fort.x * 50 - 20, fort.y * 50 + 30, 40 * healthpercent, 5);

  context.strokeStyle = 'black';
  context.strokeRect(fort.x * 50 - 20, fort.y * 50 + 30, 40, 5);

  context.drawImage(images.fort, (fort.x - 0.5) * 50, (fort.y - 0.5) * 50, 50, 50);

  if (isSelected) {
    context.strokeStyle = 'cyan';
    context.strokeRect(
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


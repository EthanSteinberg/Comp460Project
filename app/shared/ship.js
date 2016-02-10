const shipMoveSpeed = 0.05;

import { hulls } from './template';
import * as Hardpoints from './hardpoint';
import Types from './types';
import { getDistance } from './vector';

/**
 * A ship entity.
 */

export function createShipAndHardpoints(map, x, y, template, team) {
  const shipId = map.getNextEntityId();

  const hardpoints = template.hardpoints.map((hardpoint, index) => {
    if (hardpoint == null) {
      return null;
    }

    return Hardpoints.createHardpoint(map, shipId, index, hardpoint, team);
  });

  const ship = {
    x,
    y,
    id: shipId,
    team,
    type: 'ship',
    template: template,
    health: JSON.parse(JSON.stringify(hulls[template.hull])).health,
    hardpoints,
    targetMode: 'hardpoints',

    lastPositions: [],

    mode: {
      type: 'IDLE',
    },
  };

  map.addEntity(ship);

  return shipId;
}

export function getPosition(ship) {
  return { x: ship.x, y: ship.y };
}

export function getOrientation(ship) {
  const lastPosition = ship.lastPositions[0] || null;

  if (lastPosition == null) {
    return 0;
  }

  return Math.atan2(ship.y - lastPosition.y, ship.x - lastPosition.x) + Math.PI / 2;
}

export function render(ship, map, context, images, isSelected, guiSelection) {
  context.save();
  context.translate(ship.x * 50, ship.y * 50);

  const angle = getOrientation(ship);

  if (ship.team === '1') {
    context.fillStyle = 'firebrick';
  } else {
    context.fillStyle = 'royalblue';
  }
  context.beginPath();
  context.arc(0, 0, 25, 0, Math.PI * 2, true);
  context.fill();

  context.rotate(angle);
  context.drawImage(images.ship, (-0.5) * 50, (-0.5) * 50, 50, 50);
  context.restore();

  context.fillStyle = 'red';
  context.fillRect(ship.x * 50 - 20, ship.y * 50 + 30, 40, 5);

  const healthpercent = ship.health / hulls[ship.template.hull].health;

  context.fillStyle = 'green';
  context.fillRect(ship.x * 50 - 20, ship.y * 50 + 30, 40 * healthpercent, 5);

  context.strokeStyle = 'black';
  context.strokeRect(ship.x * 50 - 20, ship.y * 50 + 30, 40, 5);

  if (isSelected) {
    context.strokeStyle = 'cyan';
    context.beginPath();
    context.arc(ship.x * 50, ship.y * 50, 25, 0, Math.PI * 2, true);
    context.stroke();
  }

  if (guiSelection != null && guiSelection.type === 'roundshot' && ship.hardpoints.indexOf(guiSelection.templateNum) !== -1) {
    context.strokeStyle = 'black';
    context.beginPath();
    context.arc(ship.x * 50, ship.y * 50, 2 * 50, 0, 2 * Math.PI);
    context.stroke();
  }

  for (const hardpointId of ship.hardpoints) {
    const hardpoint = map.getEntity(hardpointId);
    if (hardpoint != null) {
      Hardpoints.render(hardpoint, map, context, images);
    }
  }
}

function setPosition(ship, x, y) {
  ship.lastPositions.push({ x, y });

  if (ship.lastPositions.length > 5) {
    ship.lastPositions.shift();
  }

  ship.x = x;
  ship.y = y;
}

export function moveTo(ship, map, targetLocation) {
  ship.mode = {
    type: 'MOVING',
    targetLocation,
  };
}

export function attackTarget(ship, target) {
  ship.mode = {
    type: 'ATTACKING',
    targetId: target.id,
  };
}

function getAvoidencVector(sourceVector, targetVector, factor) {
  const xDistance = sourceVector.x - targetVector.x;
  const yDistance = sourceVector.y - targetVector.y;
  const distanceSquared = xDistance * xDistance + yDistance * yDistance;
  const distance = Math.sqrt(distanceSquared);

  const magnitude = factor / (distance * distance);

  return {
    x: xDistance * magnitude / distance,
    y: yDistance * magnitude / distance,
  };
}

function getAvoidencVectors(ship, map) {
  const result = {
    x: 0,
    y: 0,
  };

  const pos = { x: ship.x, y: ship.y };

  for (const island of map.getIslands()) {
    for (const [x, y] of island.getCoordinates()) {
      const avoid = getAvoidencVector(pos, { x, y }, 0.05);
      result.x += avoid.x;
      result.y += avoid.y;
    }
  }

  for (const otherShip of map.getShips()) {
    if (otherShip.id === ship.id) {
      continue;
    }

    const avoid = getAvoidencVector(pos, { x: otherShip.x, y: otherShip.y }, 0.05);
    result.x += avoid.x;
    result.y += avoid.y;
  }

  return result;
}

function moveDelta(ship, delta) {
  const move = {
    x: delta.x + ship.x,
    y: delta.y + ship.y,
  };
  setPosition(ship, move.x, move.y);
}

/**
 * Are you close enough to the current waypoint?
 */
function closeEnoughToTarget(ship) {
  return getDistanceToTarget(ship, ship.mode.targetLocation) <= 0.1;
}

function getDistanceToTarget(ship, target) {
  return getDistance(getPosition(ship), target);
}


/**
 * Perform a move using ship.mode.targetLocation
 * Returns the move update
 */
function performMove(ship, map) {
  const currentMove = ship.mode.targetLocation;

  const scale = Math.min(shipMoveSpeed, getDistanceToTarget(ship, currentMove));

  const delta = {
    x: (currentMove.x - ship.x) / getDistanceToTarget(ship, currentMove) * scale,
    y: (currentMove.y - ship.y) / getDistanceToTarget(ship, currentMove) * scale,
  };

  const avoid = getAvoidencVectors(ship, map);

  const finalVector = {
    x: avoid.x + delta.x,
    y: avoid.y + delta.y,
  };

  const finalDistance = Math.sqrt(finalVector.x * finalVector.x + finalVector.y * finalVector.y);
  const deltaDistance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

  const dotProduct = (delta.x * finalVector.x + delta.y * finalVector.y) / (deltaDistance * finalDistance);

  const angle = Math.acos(dotProduct) * 180 / Math.PI;

  finalVector.x *= scale / finalDistance;
  finalVector.y *= scale / finalDistance;

  if (angle < 120) {
    moveDelta(ship, finalVector);
  }
}

/**
 * Move the ship and perform the corresponding updates.
 */
function processMove(ship, map) {
  if (closeEnoughToTarget(ship)) {
    ship.mode = {
      type: 'IDLE',
    };
    return;
  }

  performMove(ship, map);
}

/**
 * Try to attack if in range, or move into range otherwise
 */
function processAttack(ship, map) {
  const target = map.getEntity(ship.mode.targetId);

  if (target == null) {
    // Target is gone or dead
    ship.mode = {
      type: 'IDLE',
    };
    return;
  }

  const targetLocation = Types[target.type].getPosition(target, map);

  if (getDistanceToTarget(ship, targetLocation) < 2) {
    for (const hardpointId of ship.hardpoints) {
      const hardpoint = map.getEntity(hardpointId);
      if (hardpoint != null) {
        if (hardpoint.timeTillNextFire === 0) {
          Hardpoints.fire(hardpoint, map, target);
        }
      }
    }
  }

  ship.mode.targetLocation = targetLocation;

  if (closeEnoughToTarget(ship)) {
    return;
  }

  performMove(ship, map);
}

/**
 * Update the ship and get the corresponding update messages.
 */
export function processUpdate(ship, map) {
  for (const hardpointId of ship.hardpoints) {
    const hardpoint = map.getEntity(hardpointId);
    if (hardpoint != null) {
      Hardpoints.processUpdate(map.getEntity(hardpointId), map);
    }
  }

  switch (ship.mode.type) {
    case 'MOVING':
      processMove(ship, map);
      break;

    case 'ATTACKING':
      processAttack(ship, map);
      break;

    case 'IDLE':
      break;

    default:
      console.error('Unexcepted type ' + ship.mode.type);
  }
}

export function getPosition(ship) {
  return { x: ship.x, y: ship.y };
}

export function getHealth(ship) {
  return ship.health;
}

export function remove(ship, map) {
  map.removeEntity(ship.id);
  for (const hardpointId of ship.hardpoints) {
    map.removeEntity(hardpointId);
  }
}

export function updateMode(ship, targetMode) {
  ship.targetMode = targetMode;
}

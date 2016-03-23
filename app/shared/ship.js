const shipMoveSpeedFactor = 0.05 / 20;
const defenseTicksDelay = 20;


import { hulls, hardpoints } from './template';
import * as Hardpoints from './hardpoint';
import Types from './types';
import { getDistance } from './vector';

/**
 * A ship entity.
 */

export function createShipAndHardpoints(map, x, y, template, team) {
  const shipId = map.getNextEntityId();

  const myHardpoints = template.hardpoints.map((hardpoint, index) => {
    if (hardpoint == null) {
      return null;
    }

    return Hardpoints.createHardpoint(map, shipId, index, hardpoint, team);
  });

  const lastSeen = [];

  for (let i = 0; i < defenseTicksDelay; i++) {
    lastSeen.push([]);
  }

  const ship = {
    x,
    y,
    id: shipId,
    team,
    type: 'ship',
    template: template,
    health: JSON.parse(JSON.stringify(hulls[template.hull])).health,
    hardpoints: myHardpoints,

    lastPositions: [],

    lastSeen,

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
  if (ship.type === 'fort') {
    return 0;
  }

  const lastPosition = ship.lastPositions[0] || null;

  if (lastPosition == null) {
    return 0;
  }

  return Math.atan2(ship.y - lastPosition.y, ship.x - lastPosition.x) + Math.PI / 2;
}

export function render(ship, map, renderList, isSelected) {
  if (isSelected) {
    renderList.addImage('shipSelect', (-1 + ship.x) * 50, (-1 + ship.y) * 50, 2 * 50, 2 * 50);
  }

  const name = (ship.team === '1' ? 'pirate' : 'empire') + 'Ship';

  renderList.translate(ship.x * 50, ship.y * 50);

  const angle = getOrientation(ship);

  renderList.rotate(angle);
  renderList.addImage(name, (-0.5) * 50, (-0.5) * 50, 50, 50);
  renderList.rotate(-angle);
  renderList.translate(-ship.x * 50, -ship.y * 50);

  for (const hardpointId of ship.hardpoints) {
    const hardpoint = map.getEntity(hardpointId);
    if (hardpoint != null) {
      Hardpoints.render(hardpoint, map, renderList);
    }
  }
}

export function renderOverlay(ship, map, renderList) {
  renderList.addImage('black', ship.x * 50 - 22, ship.y * 50 + 28, 44, 9);

  renderList.addImage('red', ship.x * 50 - 20, ship.y * 50 + 30, 40, 5);

  const healthpercent = ship.health / hulls[ship.template.hull].health;

  renderList.addImage('green', ship.x * 50 - 20, ship.y * 50 + 30, 40 * healthpercent, 5);
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

function getAvoidencVector(sourceVector, targetVector) {
  const xDistance = sourceVector.x - targetVector.x;
  const yDistance = sourceVector.y - targetVector.y;
  const distanceSquared = xDistance * xDistance + yDistance * yDistance;
  const distance = Math.sqrt(distanceSquared);

  const magnitude = 1.0 / (distance * distance * distance * distance);

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
    for (const [x, y] of island.coordinates) {
      const avoid = getAvoidencVector(pos, { x, y });
      result.x += avoid.x;
      result.y += avoid.y;
    }
  }

  for (let x = 0; x < map.width; x++) {
    for (const y of [-1, map.height]) {
      const avoid = getAvoidencVector(pos, { x, y });
      result.x += avoid.x;
      result.y += avoid.y;
    }
  }

  for (const x of [-1, map.width]) {
    for (let y = 0; y < map.height; y++) {
      const avoid = getAvoidencVector(pos, { x, y });
      result.x += avoid.x;
      result.y += avoid.y;
    }
  }

  for (const otherShip of map.getShips()) {
    if (otherShip.id === ship.id) {
      continue;
    }

    const avoid = getAvoidencVector(pos, { x: otherShip.x, y: otherShip.y });
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

  const shipMoveSpeed = shipMoveSpeedFactor * hulls[ship.template.hull].speed;
  const scale = Math.min(shipMoveSpeed, getDistanceToTarget(ship, currentMove));

  const delta = {
    x: (currentMove.x - ship.x) / getDistanceToTarget(ship, currentMove),
    y: (currentMove.y - ship.y) / getDistanceToTarget(ship, currentMove),
  };

  const avoid = getAvoidencVectors(ship, map);

  const finalVector = {
    x: avoid.x * scale + delta.x * scale,
    y: avoid.y * scale + delta.y * scale,
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

function getActualTarget(ship, map, target) {
  if (target == null) {
    return null;
  }

  return target;
}

/**
 * Tries to shoot at the target (entity is the parent entity).
 * If there are cannons which can fire, but need to be closer, returns true.
 * Returns false if there is no point moving closer.
 */
function shootAt(ship, map, entity, target) {
  let shouldMoveCloser = false;

  const targetLocation = getPosition(entity, map);
  const distance = getDistanceToTarget(ship, targetLocation);
  for (const hardpointId of ship.hardpoints) {
    const hardpoint = map.getEntity(hardpointId);
    if (hardpoint != null && hardpoint.timeTillNextFire === 0) {
      if (distance < hardpoints[hardpoint.gunType].range) {
        Hardpoints.fire(hardpoint, map, target);
      } else {
        shouldMoveCloser = true;
      }
    }
  }

  return shouldMoveCloser;
}

/**
 * Is the target in range of at least one gun?
 */
function isInRange(ship, map, entity) {
  const targetLocation = getPosition(entity, map);
  const distance = getDistanceToTarget(ship, targetLocation);
  for (const hardpointId of ship.hardpoints) {
    const hardpoint = map.getEntity(hardpointId);
    if (hardpoint != null && hardpoint.timeTillNextFire === 0) {
      if (distance < hardpoints[hardpoint.gunType].range) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Shoot at any enemy ships in range with the current attack pattern
 */
function processIdleAttack(ship, map) {
  const currentSeen = ship.lastSeen[0];
  for (const entityId of currentSeen) {
    const entity = map.getEntity(entityId);
    const actualTarget = getActualTarget(ship, map, entity);
    if (actualTarget != null) {
      shootAt(ship, map, entity, actualTarget);
    }
  }
}

/**
 * Update the simple last seen thingy
 */
function updateLastSeen(ship, map) {
  ship.lastSeen.shift();
  const temp = [];
  for (const entity of map.entities.values()) {
    if (entity.type === 'ship' && entity.team !== ship.team) {
      if (isInRange(ship, map, entity)) {
        temp.push(entity.id);
      }
    }
  }
  ship.lastSeen.push(temp);
}

/**
 * Try to attack if in range, or move into range otherwise
 */
function processAttack(ship, map) {
  const pseudoTarget = map.getEntity(ship.mode.targetId);
  const target = getActualTarget(ship, map, pseudoTarget);

  if (target == null) {
    // Target is gone or dead
    ship.mode = {
      type: 'IDLE',
    };
    return;
  }

  console.log(pseudoTarget)
  const targetLocation = Types[pseudoTarget.type].getPosition(pseudoTarget, map);

  const shouldMoveCloser = shootAt(ship, map, pseudoTarget, target, 0);

  if (shouldMoveCloser) {
    ship.mode.targetLocation = targetLocation;

    if (closeEnoughToTarget(ship)) {
      return;
    }

    performMove(ship, map);
  }
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
      processIdleAttack(ship, map);
      break;

    case 'ATTACKING':
      processAttack(ship, map);
      break;

    case 'IDLE':
      processIdleAttack(ship, map);
      break;

    default:
      console.error('Unexcepted type ' + ship.mode.type);
  }

  updateLastSeen(ship, map);
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

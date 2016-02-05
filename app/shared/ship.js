const shipMoveSpeed = 0.05;

import astar from './astar';
import { hulls } from './template';
import * as Hardpoints from './hardpoint';
import Types from './types';
import { getDistance } from './vector';

/**
 * A ship entity.
 */

export function createShipAndHardpoints(map, x, y, template) {
  const shipId = map.getNextEntityId();

  const hardpoints = template.hardpoints.map((hardpoint, index) => {
    if (hardpoint == null) {
      return null;
    }

    return Hardpoints.createHardpoint(map, shipId, index, hardpoint);
  });

  const ship = {
    x,
    y,
    id: shipId,
    type: 'ship',
    template: template,
    health: JSON.parse(JSON.stringify(hulls[template.hull])).health,
    hardpoints,

    lastDx: 0,
    lastDy: -1,

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
  return Math.atan2(ship.lastDy, ship.lastDx) + Math.PI / 2;
}

export function render(ship, map, context, images, isSelected) {
  context.save();
  context.translate(ship.x * 50, ship.y * 50);

  const angle = getOrientation(ship);

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

  for (const hardpointId of ship.hardpoints) {
    const hardpoint = map.getEntity(hardpointId);
    if (hardpoint != null) {
      Hardpoints.render(hardpoint, map, context, images);
    }
  }
}

function setPosition(ship, x, y) {
  ship.lastDx = x - ship.x;
  ship.lastDy = y - ship.y;

  ship.x = x;
  ship.y = y;
}

export function moveTo(ship, map, targetLocation) {
  const moves = performAStar(ship, map, targetLocation);

  if (moves != null) {
    ship.mode = {
      type: 'MOVING',
      moves: moves,
      moveIndex: 0,
    };
  }
}

export function attackTarget(ship, target) {
  ship.mode = {
    type: 'ATTACKING',
    targetId: target.id,
  };
}

function performAStar(ship, map, targetLocation) {
  const startPosition = { x: Math.round(ship.x), y: Math.round(ship.y) };
  const endPosition = { x: Math.round(targetLocation.x), y: Math.round(targetLocation.y) };

  const isEmpty = ({ x: tempX, y: tempY }) => {
    return !map.isIsland(tempX, tempY);
  };
  const isValid = ({ x: tempX, y: tempY }) => {
    return tempX >= 0 && tempX < map.width && tempY >= 0 && tempY < map.height;
  };
  const moves = astar(startPosition, endPosition, isEmpty, isValid);

  if (moves == null) {
    console.log('no such path');
    return null;
  }

  moves.splice(0, 1); // Remove the first item
  moves[moves.length - 1] = targetLocation;
  return moves;
}

function canMove(ship, map, move) {
  for (const otherShip of map.getShips()) {
    if (otherShip.id === ship.id) {
      continue;
    }

    const xDistance = move.x - otherShip.x;
    const yDistance = move.y - otherShip.y;
    const distanceSquared = xDistance * xDistance + yDistance * yDistance;
    if (distanceSquared < 1) {
      return false;
    }

    // TODO: Need to check surrounding island borders
  }
  return true;
}

function tryMove(ship, map, move) {
  if (canMove(ship, map, move)) {
    setPosition(ship, move.x, move.y);
  }
}

/**
 * Are you close enough to the current waypoint?
 */
function closeEnoughToWayPoint(ship) {
  return getDistanceToTarget(ship, ship.mode.moves[ship.mode.moveIndex]) <= 0.01;
}

function getDistanceToTarget(ship, target) {
  return getDistance(getPosition(ship), target);
}


/**
 * Perform a move using ship.mode.moveIndex and ship.mode.moves.
 * Returns the move update
 */
function performMove(ship, map) {
  const currentMove = ship.mode.moves[ship.mode.moveIndex];

  const scale = Math.min(shipMoveSpeed, getDistanceToTarget(ship, currentMove));

  const move = {
    x: ship.x + (currentMove.x - ship.x) / getDistanceToTarget(ship, currentMove) * scale,
    y: ship.y + (currentMove.y - ship.y) / getDistanceToTarget(ship, currentMove) * scale,
  };

  tryMove(ship, map, move);
}

/**
 * Move the ship and perform the corresponding updates.
 */
function processMove(ship, map) {
  if (ship.mode.moveIndex === ship.mode.moves.length) {
    ship.mode = {
      type: 'IDLE',
    };
    return;
  }

  if (closeEnoughToWayPoint(ship)) {
    ship.mode.moveIndex += 1;
  }

  if (ship.mode.moveIndex === ship.mode.moves.length) {
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

  const targetPosition = Types[target.type].getPosition(target, map);

  if (getDistanceToTarget(ship, targetPosition) < 2) {
    for (const hardpointId of ship.hardpoints) {
      const hardpoint = map.getEntity(hardpointId);
      if (hardpoint != null) {
        if (hardpoint.timeTillNextFire === 0) {
          Hardpoints.fire(hardpoint, map, target);
        }
      }
    }
  }

  // Try all posible sides if the main way doesn't work.

  const right = { x: targetPosition.x + 1, y: targetPosition.y };
  const left = { x: targetPosition.x - 1, y: targetPosition.y };

  const up = { x: targetPosition.x, y: targetPosition.y - 1 };
  const down = { x: targetPosition.x, y: targetPosition.y + 1 };

  const posibilities = [
    targetPosition,
    right,
    left,
    up,
    down,
  ];

  let bestOne = null;

  for (const possib of posibilities) {
    const moves = performAStar(ship, map, possib);
    if (moves != null && (bestOne == null || bestOne.length > moves.length)) {
      bestOne = moves;
    }
  }

  ship.mode.moves = bestOne;

  if (ship.mode.moves == null) {
    // No such path
    return;
  }

  ship.mode.moveIndex = 0;

  if (ship.mode.moveIndex === ship.mode.moves.length) {
    return;
  }

  if (closeEnoughToWayPoint(ship)) {
    ship.mode.moveIndex += 1;
  }

  if (ship.mode.moveIndex === ship.mode.moves.length) {
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

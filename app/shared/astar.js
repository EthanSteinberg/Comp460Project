function getNeighbers(position) {
  const { x, y } = position;
  return [
    { x: (x + 1), y },
    { x: (x - 1), y },
    { x, y: (y - 1) },
    { x, y: (y + 1) },
  ];
}

function serialize(position) {
  return position.x + ',' + position.y;
}

function heuristic(position, targetPosition) {
  return Math.abs(position.x - targetPosition.x) + Math.abs(position.y - targetPosition.y);
}

function minSet(set, scoreFunction) {
  if (set.size === 0) {
    console.error('Min array on size of zero');
  }

  let minItem = null;

  for (const item of set) {
    if (minItem == null || scoreFunction(item) < scoreFunction(minItem)) {
      minItem = item;
    }
  }

  return minItem;
}

/**
 * A simple implementation of the astar search algorithm.
 * TODO: Switch to priority queue. Split work between frames.
 * startPosition and targetPosition are coordinates of the form {x:0, y:0}.
 * isEmpty marks if a coordinate is empty.
 * isValid marks if a coordinate is valid for moving onto.
 */
export default function astar(startPosition, targetPosition, isEmpty, isValid) {
  const visited = new Set();
  const openset = new Set([startPosition]);
  const scoreMap = {};
  const backtrackMap = {};

  scoreMap[serialize(startPosition)] = 0;

  const scoreFunction = (item) => scoreMap[serialize(item)] + heuristic(item, targetPosition);

  while (openset.size !== 0) {
    const nextItem = minSet(openset, scoreFunction);
    visited.add(serialize(nextItem));
    openset.delete(nextItem);

    if (serialize(nextItem) === serialize(targetPosition)) {
      const result = [];
      let currentItem = targetPosition;
      while (serialize(currentItem) !== serialize(startPosition)) {
        result.push(currentItem);
        currentItem = backtrackMap[serialize(currentItem)];
      }
      result.reverse();
      return result;
    }

    for (const neighbor of getNeighbers(nextItem)) {
      if (isValid(neighbor) && isEmpty(neighbor) && !visited.has(serialize(neighbor))) {
        const nextDistance = scoreMap[serialize(nextItem)] + 1;
        if (serialize(neighbor) in scoreMap) {
          if (nextDistance < scoreMap[serialize(neighbor)]) {
            scoreMap[serialize(neighbor)] = nextDistance;
            backtrackMap[serialize(neighbor)] = nextItem;
          } else {
            // Do nothing, as it is a worse path
          }
        } else {
          scoreMap[serialize(neighbor)] = nextDistance;
          backtrackMap[serialize(neighbor)] = nextItem;
          openset.add(neighbor);
        }
      }
    }
  }

  return null;
}

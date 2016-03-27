import Types from './types';
import { hardpoints } from './template';

export function createProjectile(map, position, target, projectileType, sourceShip) {
  const projectile = {
    id: map.getNextEntityId(),
    position,
    targetId: target.id,
    type: 'projectile',
    projectileType,
    sourceShip,
    dead: false,
    deadTime: 100,
  };

  map.addEntity(projectile);

  return projectile.id;
}

export function processUpdate(projectile, map) {
  if (projectile.dead == true) {
    return;
  }

  const target = map.getEntity(projectile.targetId);
  if (target == null) {
    map.removeEntity(projectile.id);
    return;
  }

  const targetPosition = Types[target.type].getPosition(target, map);

  const dx = targetPosition.x - projectile.position.x;
  const dy = targetPosition.y - projectile.position.y;

  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 0.1) {

    if (projectile.projectileType == 'grapeshot') {
      for (const neighbor of map.getShips()) {

        if (neighbor.id == projectile.sourceShip) {
          continue;
        }

        const neighborPosition = Types[neighbor.type].getPosition(neighbor, map);

        const ndx = neighborPosition.x - projectile.position.x;
        const ndy = neighborPosition.y - projectile.position.y;

        const ndist = Math.sqrt(ndx * ndx + ndy * ndy);

        if (ndist < 2.0) {
          neighbor.health -= hardpoints[projectile.projectileType].damage;

          if (neighbor.health <= 0) {
            Types[neighbor.type].remove(neighbor, map);
          }
        }
      }
    } else {
      projectile.deadTime = 0

      target.health -= hardpoints[projectile.projectileType].damage;

      if (target.health <= 0) {
        Types[target.type].remove(target, map);
      }      
    }

    projectile.dead = true;

  } else {
    const movement = Math.min(dist, 0.2);

    projectile.position.x += dx / dist * movement;
    projectile.position.y += dy / dist * movement;
  }
}

export function render(projectile, map, renderList) {
  const radius = 10;

  if (projectile.dead && projectile.projectileType == 'grapeshot') {
    renderList.addImage('explosion', projectile.position.x * 50 - (radius * projectile.deadTime/10) / 2, 
      projectile.position.y * 50 - (radius * projectile.deadTime/10) / 2, 
      radius * projectile.deadTime/10, radius * projectile.deadTime/10);

    projectile.deadTime--;
  } else {
    renderList.addImage(projectile.projectileType, projectile.position.x * 50 - radius / 2, projectile.position.y * 50 - radius / 2, radius, radius);
  }

  if (projectile.deadTime == 0) {
    map.removeEntity(projectile.id);
  }  
}

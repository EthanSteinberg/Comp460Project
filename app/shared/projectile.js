import Types from './types';
import { hardpoints } from './template';

export function createProjectile(map, position, target, projectileType) {
  const projectile = {
    id: map.getNextEntityId(),
    position,
    targetId: target.id,
    type: 'projectile',
    projectileType,
  };

  map.addEntity(projectile);

  return projectile.id;
}

export function processUpdate(projectile, map) {
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
    map.removeEntity(projectile.id);

    target.health -= hardpoints[projectile.projectileType].damage;

    if (target.health <= 0) {
      Types[target.type].remove(target, map);
    }
  } else {
    const movement = Math.min(dist, 0.2);

    projectile.position.x += dx / dist * movement;
    projectile.position.y += dy / dist * movement;
  }
}

export function render(projectile, map, renderList) {
  const radius = 10;
  renderList.addImage(projectile.projectileType, projectile.position.x * 50 - radius / 2, projectile.position.y * 50 - radius / 2, radius, radius);
}

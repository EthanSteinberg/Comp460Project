import * as Ships from './ship';
import Types from './types';

export function createProjectile(map, position, target) {
  const projectile = {
    id: map.getNextEntityId(),
    position,
    targetId: target.id,
    type: 'projectile',
  };

  map.addEntity(projectile);

  return projectile.id;
}

export function processUpdate(projectile, map) {
  const target = map.getEntity(projectile.targetId);
  if (target == null) {
    map.removeEntity(projectile);
    return;
  }

  const targetPosition = Types[target.type].getPosition(target, map);

  const dx = targetPosition.x - projectile.position.x;
  const dy = targetPosition.y - projectile.position.y;

  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 0.01) {
    map.removeEntity(projectile.id);

    target.health -= 50;

    if (target.health <= 0) {
      map.removeEntity(projectile.targetId);
    }
  } else {
    const movement = Math.min(dist, 0.1);

    projectile.position.x += dx / dist * movement;
    projectile.position.y += dy / dist * movement;
  }
}

export function render(projectile, map, context, images) {
  const radius = 10;
  context.drawImage(images.roundshot, projectile.position.x * 50 - radius / 2, projectile.position.y * 50 - radius / 2, radius, radius);
}

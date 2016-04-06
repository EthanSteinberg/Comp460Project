import Types from './types';

import { getDistance } from './vector';

export function createHealth(maxHealth, parentId) {
  return {
    health: maxHealth,
    maxHealth,
    parentId,
    burningDamageLeft: 0,
  };
}

export function damage(health, map, amount) {
  health.health -= amount;
  if (health.health <= 0) {
    const parent = map.getEntity(health.parentId);
    if (parent != null) {
      Types[parent.type].remove(parent, map);
    } else {
      console.log("Parent was null", parent)
    }
  }
}

export function setOnFire(health, amount) {
  if (health.burningDamageLeft <= 0) {
    health.burningDamageLeft = amount;
    health.fireStrength = amount;
  }
}


function spreadFire(health, map) {
  const parent = map.getEntity(health.parentId);
  for (const entity of map.entities.values()) {
    if (entity.health != null && getDistance(parent, entity) < 1.0) {
      setOnFire(entity.health, health.fireStrength);
    }
  }
}

export function processUpdate(health, map) {
  if (health.burningDamageLeft > 0) {
    spreadFire(health, map);

    health.burningDamageLeft -= 0.25;

    damage(health, map, 0.25);
  }
}

export function render(health, map, renderList) {
  const parent = map.getEntity(health.parentId);

  const x = parent.x;
  const y = parent.y;

  renderList.addImage('black', x * 50 - 22, y * 50 + 28, 44, 9);

  renderList.addImage('red', x * 50 - 20, y * 50 + 30, 40, 5);

  const yellowhealth = health.health / health.maxHealth;

  renderList.addImage('yellow', x * 50 - 20, y * 50 + 30, 40 * yellowhealth, 5);

  const healthpercent = Math.max(0, (health.health - health.burningDamageLeft) / health.maxHealth);

  renderList.addImage('green', x * 50 - 20, y * 50 + 30, 40 * healthpercent, 5);
}

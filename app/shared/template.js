/**
 * A shipyard entity.
 */
let nextId = 0;

export const roundshot = {
  name: 'Roundshot',
  description: 'Standard range. Deals 25 dmg.',
  health: 100,
  damage: 25,
  speed: 0,
  weight: -10,
  cost: 30,
  tcost: 10,
  range: 2,
};

export const chainshot = {
  name: 'Chainshot',
  description: 'Slows ships. Deals 5 dmg.',
  health: 100,
  damage: 5,
  speed: 0,
  weight: -20,
  cost: 25,
  tcost: 10,
};

export const grapeshot = {
  name: 'Grapeshot',
  description: 'Short range. Deals 50 dmg.',
  health: 100,
  damage: 50,
  speed: 0,
  weight: -5,
  cost: 50,
  tcost: 20,
  range: 1,
};

export const shell = {
  name: 'Shell',
  description: 'Long range. Deals 10 dmg.',
  health: 100,
  damage: 10,
  speed: 0,
  weight: -20,
  cost: 50,
  tcost: 20,
  range: 3,
};

export const gunboat = {
  name: 'Gunboat',
  description: 'Small fast ship.',
  health: 100,
  damage: 0,
  speed: 20,
  weight: 25,
  cost: 50,
  tcost: 60,
};

export const frigate = {
  name: 'Frigate',
  description: 'Well balanced ship.',
  health: 200,
  damage: 0,
  speed: 15,
  weight: 50,
  cost: 100,
  tcost: 120,
};

export const galleon = {
  name: 'Galleon',
  description: 'The pearl of the navy.',
  health: 300,
  damage: 0,
  speed: 10,
  weight: 100,
  cost: 125,
  tcost: 180,
};

export const hardpoints = {
  roundshot,
  chainshot,
  grapeshot,
  shell,
};

export const hulls = {
  gunboat,
  frigate,
  galleon,
};

const empty = {
  health: 0,
  damage: 0,
  speed: 0,
  weight: 0,
  cost: 0,
  tcost: 0,
};

// Every stats template is in the form:
/*

{
  hull: hull type, as a string,
  hardpoints: [each hardpoint, as a string]
}
*/

export function getStats(template) {
  const start = JSON.parse(JSON.stringify(hulls[template.hull] || empty));
  for (const hardpoint of (template.hardpoints || [])) {
    if (hardpoint == null) {
      continue;
    }
    for (const key of Object.keys(start)) {
      start[key] += hardpoints[hardpoint][key];
    }
  }

  return start;
}

export function defaultTemplate() {
  return {
    hull: 'gunboat',
    hardpoints: ['roundshot'],
  };
}

/**
 * A shipyard entity.
 */
let nextId = 0;

const roundshot = {
  health: 100,
  damage: 10,
  speed: 0,
  weight: -10,
  wcost: 10,
  ccost: 10,
  tcost: 10,
};

const chainshot = {
  health: 100,
  damage: 5,
  speed: 0,
  weight: -20,
  wcost: 25,
  ccost: 10,
  tcost: 10,
};

const grapeshot = {
  health: 100,
  damage: 20,
  speed: 0,
  weight: -5,
  wcost: 50,
  ccost: 50,
  tcost: 20,
};

const shell = {
  health: 100,
  damage: 5,
  speed: 0,
  weight: -20,
  wcost: 50,
  ccost: 100,
  tcost: 20,
};

const gunboat = {
  health: 100,
  damage: 0,
  speed: 20,
  weight: 25,
  wcost: 100,
  ccost: 10,
  tcost: 60,
};

const frigate = {
  health: 300,
  damage: 0,
  speed: 10,
  weight: 50,
  wcost: 200,
  ccost: 50,
  tcost: 120,
};

const galleon = {
  health: 600,
  damage: 0,
  speed: 5,
  weight: 100,
  wcost: 300,
  ccost: 100,
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
  wcost: 0,
  ccost: 0,
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
    hardpoints: [],
  };
}

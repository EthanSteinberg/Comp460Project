import buildingConstants from './buildingconstants';
import * as Health from './health';


export function createBuildingTemplate(map, x, y, team, islandID, buildingType) {
  const id = map.getNextEntityId();
  const template = {
    x,
    y,
    id,
    buildingType,
    progressTowardsBuild: 0,
    type: 'buildingTemplate',
    team,
    islandID,
    health: Health.createHealth(100, id),
    maxCoinFlow: buildingConstants[buildingType].maxCoinFlow
  };

  map.addEntity(template);

  return template.id;
}

export function render(template, map, renderList) {
  const name = (template.team === '1') ? 'pirateCircle' : 'imperialCircle';

  renderList.addImage(name, template.x * 50 - 25, template.y * 50 - 25);

  switch (template.buildingType) {
    case 'shipyard':
      renderList.addImage('shipyard2', (template.x - 0.5) * 50, (template.y - 0.5) * 50, 50, 50);
      break;
    case 'mine':
      renderList.addImage('mine2', (template.x - 0.5) * 50, (template.y - 0.5) * 50, 50, 50);
      break;
    case 'fort':
      renderList.addImage('fort', (template.x - 0.5) * 50, (template.y - 0.5) * 50, 50, 50);
      break;

    default:
      console.error('No support for building type', template.buildingType);
  }

  const angle = (template.progressTowardsBuild) / buildingConstants[template.buildingType].coinCost * Math.PI * 2;
  renderList.addCircleCutout('quarterAlphaGray', (Math.PI * 2) - angle, (template.x - 0.5) * 50, (template.y - 0.5) * 50, 50, 50);
}

export function processUpdate(template, map) {
  if (map.getMaxCoinFlow() > map.getEntity(template.team).coins) {
    var cost = map.getEntity(template.team).coins / map.getBuildQueue().length;
    template.progressTowardsBuild += cost
    map.getEntity(template.team).coins -= cost;
  } else {
    var cost = buildingConstants[template.buildingType].maxCoinFlow; 
    template.progressTowardsBuild += cost;
    map.getEntity(template.team).coins -= cost;
  }

  if (template.progressTowardsBuild >= buildingConstants[template.buildingType].coinCost) {
    map.addBuilding(
      template.buildingType,
      template.x,
      template.y,
      template.islandID,
      template.team
    );
    map.removeEntityFromQueue(template)
    map.removeEntity(template.id);
  }
}

export function getPosition(template) {
  return { x: template.x, y: template.y };
}

export function remove(template, map) {
  map.removeEntity(template.id);
}

import buildingConstants from './buildingconstants';

export function createBuildingTemplate(map, x, y, team, islandID, buildingType) {
  const template = {
    x,
    y,
    id: map.getNextEntityId(),
    buildingType,
    progressTowardsBuild: 0,
    type: 'buildingTemplate',
    team,
    islandID,
    health: 100,
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

  const angle = (template.progressTowardsBuild) / buildingConstants[template.buildingType].buildTime * Math.PI * 2;
  renderList.addCircleCutout('quarterAlphaGray', angle, (template.x - 0.5) * 50, (template.y - 0.5) * 50, 50, 50);

  renderList.addImage('black', template.x * 50 - 22, template.y * 50 + 28, 44, 9);

  renderList.addImage('red', template.x * 50 - 20, template.y * 50 + 30, 40, 5);

  const healthpercent = template.health / 100;

  renderList.addImage('green', template.x * 50 - 20, template.y * 50 + 30, 40 * healthpercent, 5);
}

export function processUpdate(template, map) {
  template.progressTowardsBuild += 1;
  if (template.progressTowardsBuild === buildingConstants[template.buildingType].buildTime) {
    map.addBuilding(
      template.buildingType,
      template.x,
      template.y,
      template.islandID,
      template.team
    );
    map.removeEntity(template.id);
  }
}

export function remove(template, map) {
  map.removeEntity(template.id);
}

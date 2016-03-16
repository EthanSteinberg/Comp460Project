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

export function render(template, map, context, images) {
  if (template.team === '1') {
    context.fillStyle = 'firebrick';
  } else {
    context.fillStyle = 'royalblue';
  }

  context.beginPath();
  context.arc(template.x * 50, template.y * 50, 25, 0, Math.PI * 2, true);
  context.fill();

  switch (template.buildingType) {
    case 'shipyard':
      context.drawImage(images.shipyard, (template.x - 0.5) * 50, (template.y - 0.5) * 50, 50, 50);
      break;
    case 'mine':
      context.drawImage(images.mine, (template.x - 0.5) * 50, (template.y - 0.5) * 50, 50, 50);
      break;
    case 'fort':
      context.drawImage(images.fort, (template.x - 0.5) * 50, (template.y - 0.5) * 50, 50, 50);
      break;

    default:
      console.error('No support for building type', template.buildingType);
  }

  context.save();
  context.beginPath();
  context.rect((template.x - 0.5) * 50, (template.y - 0.5) * 50, 50, 50);
  context.clip();

  const angle = (template.progressTowardsBuild) / buildingConstants[template.buildingType].buildTime * Math.PI * 2;

  context.globalCompositeOperation = 'multiply';
  context.fillStyle = 'rgba(0,0,0,.5)';
  context.beginPath();
  context.arc(template.x * 50, template.y * 50, 50, 0, angle, true);
  context.lineTo(template.x * 50, template.y * 50);
  context.fill();
  context.globalCompositeOperation = 'source-over';

  context.strokeStyle = 'white';
  context.beginPath();
  context.moveTo(template.x * 50, template.y * 50);
  context.lineTo(template.x * 50 + 50, template.y * 50);
  context.arc(template.x * 50, template.y * 50, 50, 0, angle, true);
  context.lineTo(template.x * 50, template.y * 50);
  context.stroke();

  context.restore();


  context.fillStyle = 'red';
  context.fillRect(template.x * 50 - 20, template.y * 50 + 30, 40, 5);

  const healthpercent = template.health / 100;

  context.fillStyle = 'green';
  context.fillRect(template.x * 50 - 20, template.y * 50 + 30, 40 * healthpercent, 5);

  context.strokeStyle = 'black';
  context.strokeRect(template.x * 50 - 20, template.y * 50 + 30, 40, 5);
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

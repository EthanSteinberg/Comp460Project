export function createBuildingTemplate(map, x, y, team, islandID, buildingType) {
  const template = {
    x,
    y,
    id: map.getNextEntityId(),
    buildingType,
    timeTillBuild: 100,
    type: 'buildingTemplate',
    team,
    islandID,
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

    default:
      console.error('No support for building type', template.buildingType);
  }

  context.save();
  context.beginPath();
  context.rect((template.x - 0.5) * 50, (template.y - 0.5) * 50, 50, 50);
  context.clip();

  const angle = (100 - template.timeTillBuild) / 100 * Math.PI * 2;

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
}

export function processUpdate(template, map) {
  template.timeTillBuild -= 1;
  if (template.timeTillBuild === 0) {
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

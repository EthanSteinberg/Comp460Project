import * as Ships from './ship';
import * as Hardpoints from './hardpoint';
import * as Shipyard from './shipyard';
import * as Mine from './mine';
import * as Fort from './fort';
import * as Island from './island';
import * as BuildingTemplate from './buildingtemplate';
import * as Projectile from './projectile';


const Types = {
  'ship': Ships,
  'hardpoint': Hardpoints,
  'shipyard': Shipyard,
  'mine': Mine,
  'fort': Fort,
  'playerstate': {},
  'island': Island,
  'buildingTemplate': BuildingTemplate,
  'projectile': Projectile,
};

export default Types;

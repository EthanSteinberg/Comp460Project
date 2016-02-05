import GameMap from '../shared/gamemap';
import buildingConstants from '../shared/buildingconstants';

import * as Ships from '../shared/ship';
import * as Hardpoints from '../shared/hardpoint';
import Types from '../shared/types';
import * as Vectors from '../shared/vector';

const http = require('http');
const ws = require('ws');
const path = require('path');

const express = require('express');
const server = http.createServer();

const WebSocketServer = ws.Server;
const wss = new WebSocketServer({ server });

const app = express();

const appDir = path.dirname(require.main.filename);

const MILLISECONDS_PER_LOGIC_UPDATE = 30;

const map = new GameMap();

const playerSockets = [];

let pendingUpdates = [];

function serializeMapEntities() {
  const result = [];
  for (const [key, entity] of map.entities) {
    result[key] = JSON.stringify(entity);
  }
  return result;
}

let lastEntityState = serializeMapEntities();

function updateGameState() {
  const updateMessages = pendingUpdates;

  map.processUpdate();

  const currentEntityState = serializeMapEntities();

  // Scan for changes in entities and add new entities
  // TODO: Need a faster way to scan for changes
  for (const id of Object.keys(currentEntityState)) {
    if (lastEntityState[id] !== currentEntityState[id]) {
      updateMessages.push({ type: 'UpdateEntity', id, data: JSON.parse(currentEntityState[id]) });
    }
  }

  // Remove removed things
  for (const id of Object.keys(lastEntityState)) {
    if (!(id in currentEntityState)) {
      updateMessages.push({ type: 'RemoveEntity', id });
    }
  }

  lastEntityState = currentEntityState;

  // Clear the pending updates list.
  pendingUpdates = [];

  for (const updateMessage of updateMessages) {
    for (const playerSocket of playerSockets) {
      playerSocket.send(JSON.stringify(updateMessage));
    }
  }
}

setInterval(updateGameState, MILLISECONDS_PER_LOGIC_UPDATE);

app.get('/', (req, res) => {
  res.sendFile(appDir + '/static/index.html');
});

app.use('/dist', express.static('dist'));
app.use('/static', express.static('static'));

function moveShipHandler({ shipId, targetLocation }) {
  // Move the ship
  const ship = map.getEntity(shipId);

  Ships.moveTo(ship, map, targetLocation);
}

function makeBuildingHandler({ building, x, y }) {
  const islandID = map.getIsland(x, y);
  if (islandID !== -1) {
    const buildingStats = buildingConstants[building];
    if (buildingStats.coinCost > map.getEntity('0').coins) {
      console.error('Trying to build a buildng you cant afford');
      return;
    }
    map.getEntity('0').coins -= buildingStats.coinCost;
    map.addBuilding(building, x, y, islandID);
  }
}

function makeShipHandler({ islandID, x, y, template }) {
  if (map.isNextToIsland(islandID, x, y)) {
    Ships.createShipAndHardpoints(map, x, y, template);
  }
}

function attackShipHandler({ id, targetId }) {
  const sourceShip = map.getEntity(id);
  const targetShip = map.getEntity(targetId);

  Ships.attackTarget(sourceShip, targetShip);
}


function fireShotHandler({ targetId, id }) {
  const hardpoint = map.getEntity(id);
  const ship = map.getEntity(hardpoint.shipId);

  const target = map.getEntity(targetId);

  const targetPosition = Types[target.type].getPosition(target, map);
  const position = Ships.getPosition(ship);

  console.log(Vectors.getDistance(position, targetPosition));

  if (hardpoint.timeTillNextFire !== 0 || Vectors.getDistance(position, targetPosition) >= 2) {
    // Don't fire if still waiting or out of distance.
    return;
  }

  Hardpoints.fire(hardpoint, map, map.getEntity(targetId));
}

const messageHandlers = {
  'MoveShip': moveShipHandler,
  'MakeBuilding': makeBuildingHandler,
  'MakeShip': makeShipHandler,
  'AttackShip': attackShipHandler,
  'FireShot': fireShotHandler,
};

wss.on('connection', function connection(socket) {
  playerSockets.push(socket);

  socket.on('message', function incoming(message) {
    console.error('received: "%s"', message);
    const actualMessage = JSON.parse(message);
    if (actualMessage.type in messageHandlers) {
      messageHandlers[actualMessage.type](actualMessage);
    }
  });

  socket.on('close', function close() {
    const index = playerSockets.indexOf(socket);
    playerSockets.splice(index, 1);
  });
});

server.on('request', app);
server.listen(3000, () => {
  console.log('Listening on ' + server.address().port);
});

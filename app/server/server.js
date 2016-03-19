import buildingConstants from '../shared/buildingconstants';

import * as Ships from '../shared/ship';
import * as BuildingTemplates from '../shared/buildingtemplate';
import * as Shipyards from '../shared/shipyard';
import { getStats } from '../shared/template';

import { createMap } from '../shared/maps';

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

let map = null;

let currentMapNum = 0;

const playerSockets = {};

const debug = false;

function sendMessageToPlayer(team, message) {
  playerSockets[team].send(JSON.stringify(message));
}

let pendingUpdates = [];


function serializeMapEntities() {
  const result = [];
  for (const [key, entity] of map.entities) {
    result[key] = JSON.stringify(entity);
  }
  return result;
}

let lastEntityState = null;

function setNewMap(newMap) {
  map = newMap;
  lastEntityState = serializeMapEntities();
}

const teamReadyMap = {
  '0': false,
  '1': false,
};

function gameOver(winningTeam) {
  for (const team of Object.keys(teamReadyMap)) {
    teamReadyMap[team] = false;
  }

  for (const team of Object.keys(playerSockets)) {
    playerSockets[team].send(JSON.stringify({ type: 'GameOver', winningTeam }));
    playerSockets[team].send(JSON.stringify({ type: 'AssignTeam', team, readyStates: teamReadyMap, mapNum: 0 }));
  }

  currentMapNum = 0;
  map = null;
}

function updateGameState() {
  if (map == null) return;

  const updateMessages = pendingUpdates;

  map.processUpdate();

  const teamCounts = map.countPlayerItems();
  if (teamCounts['0'] === 0) {
    gameOver('1');
    return;
  } else if (teamCounts['1'] === 0) {
    gameOver('0');
    return;
  }

  const currentEntityState = serializeMapEntities();

  // Scan for changes in entities and add new entities
  // TODO: Need a faster way to scan for changes
  for (const id of Object.keys(currentEntityState)) {
    if (lastEntityState[id] !== currentEntityState[id]) {
      if (lastEntityState[id] != null) {
        updateMessages.push({ type: 'UpdateEntity', id, data: JSON.parse(currentEntityState[id]) });
      } else {
        updateMessages.push({ type: 'AddEntity', id, data: JSON.parse(currentEntityState[id]) });
      }
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

  const message = {
    type: 'MultiMessage',
    messages: updateMessages,
  };

  for (const team of Object.keys(playerSockets)) {
    const playerSocket = playerSockets[team];
    playerSocket.send(JSON.stringify(message));
  }
}

setInterval(updateGameState, MILLISECONDS_PER_LOGIC_UPDATE);

app.get('/', (req, res) => {
  res.sendFile(appDir + '/static/index.html');
});

app.use('/dist', express.static('dist'));
app.use('/static', express.static('static'));

function moveShipHandler({ shipId, targetLocation }, playerTeam) {
  // Move the ship
  const ship = map.getEntity(shipId);

  if (ship == null) {
    return;
  }

  if (ship.team === playerTeam) {
    Ships.moveTo(ship, map, targetLocation);
  }
}

function makeBuildingHandler({ building, x, y }, playerTeam) {
  const island = map.getIsland(x, y);

  if (map.getItem(x, y) != null) {
    console.error('Something blocking the space');
    return;
  }

  if (island == null || island.team !== playerTeam) {
    console.error('Wrong team for island', island, playerTeam);
    return;
  }

  const buildingStats = buildingConstants[building];
  if (buildingStats.coinCost > map.getEntity(playerTeam).coins) {
    console.error('Trying to build a buildng you cant afford');
    const soundId = playerTeam === '0' ? 'empireMoreGold' : 'pirateMoreGold';
    sendMessageToPlayer(playerTeam, { type: 'PlaySound', soundId });
    return;
  }
  map.getEntity(playerTeam).coins -= buildingStats.coinCost;
  BuildingTemplates.createBuildingTemplate(map, x, y, playerTeam, island.id, building);
}

function cancelShipHandler({ shipyardId, templateNumber }, playerTeam) {
  const shipyard = map.getEntity(shipyardId);
  if (shipyard == null) {
    return;
  }

  if (shipyard.team !== playerTeam) {
    console.error('Not allowed to use enemy shipyard');
    return;
  }

  Shipyards.removeTemplateFromQueue(shipyard, map, templateNumber);
}

function makeShipHandler({ shipyardId, template, templateNumber }, playerTeam) {
  const shipyard = map.getEntity(shipyardId);
  if (shipyard == null) {
    return;
  }

  if (shipyard.team !== playerTeam) {
    console.error('Not allowed to use enemy shipyard');
    return;
  }

  const stats = getStats(template);

  if (stats.cost > map.getEntity(playerTeam).coins) {
    console.error('Trying to build a ship you cant afford');

    const soundId = playerTeam === '0' ? 'empireMoreGold' : 'pirateMoreGold';
    sendMessageToPlayer(playerTeam, { type: 'PlaySound', soundId });
    return;
  }

  map.getEntity(playerTeam).coins -= stats.cost;

  Shipyards.addTemplateToQueue(shipyard, templateNumber, template);
}

function attackShipHandler({ id, targetId }, playerTeam) {
  const sourceShip = map.getEntity(id);
  const targetShip = map.getEntity(targetId);

  if (sourceShip == null) {
    return;
  }

  if (targetShip == null) {
    // Target is already dead!
    return;
  }

  if (sourceShip.team !== playerTeam) {
    console.error('You are not allowed to command enemy ships.');
    return;
  }

  Ships.attackTarget(sourceShip, targetShip);
}

function updateModeHandler({ targetMode }, playerTeam) {
  map.getEntity(playerTeam).targetMode = targetMode;
}

function updateMap({ mapNum }) {
  currentMapNum = mapNum;
  for (const team of Object.keys(playerSockets)) {
    playerSockets[team].send(JSON.stringify({ type: 'UpdateMap', mapNum }));
  }
}

function updateReadyState({ readyState }, playerTeam) {
  teamReadyMap[playerTeam] = readyState;

  for (const team of Object.keys(playerSockets)) {
    playerSockets[team].send(JSON.stringify({ type: 'UpdateReadyStates', readyStates: teamReadyMap }));
  }

  for (const team of Object.keys(teamReadyMap)) {
    if (teamReadyMap[team] === false) {
      return; // Some is not ready yet
    }
  }

  // Start the game!

  setNewMap(createMap(currentMapNum));

  for (const team of Object.keys(playerSockets)) {
    playerSockets[team].send(JSON.stringify({ type: 'StartGame', initialState: map.getInitialState(), team }));
  }
}

const messageHandlers = {
  'MoveShip': moveShipHandler,
  'MakeBuilding': makeBuildingHandler,
  'MakeShip': makeShipHandler,
  'CancelShip': cancelShipHandler,
  'AttackShip': attackShipHandler,
  'UpdateMode': updateModeHandler,
  'SetReadyState': updateReadyState,
  'UpdateMap': updateMap,
};

let nextTeam = 0;

if (debug) {
  setNewMap(createMap(0));
}

wss.on('connection', function connection(socket) {
  let playerTeam = String(nextTeam);
  if (debug) {
    playerTeam = '0';
  }

  nextTeam += 1;

  playerSockets[playerTeam] = socket;

  if (debug) {
    socket.send(JSON.stringify({ type: 'StartGame', initialState: map.getInitialState(), team: playerTeam }));
  } else {
    socket.send(JSON.stringify({ type: 'AssignTeam', team: playerTeam, readyStates: teamReadyMap, mapNum: currentMapNum }));
  }

  socket.on('message', function incoming(message) {
    // console.error('received: "%s"', message);
    const actualMessage = JSON.parse(message);
    if (actualMessage.type in messageHandlers) {
      messageHandlers[actualMessage.type](actualMessage, playerTeam);
    } else {
      console.error('No handler for type:', actualMessage.type);
    }
  });

  socket.on('close', function close() {
    delete playerSockets[playerTeam];
  });
});

server.on('request', app);
server.listen(3000, () => {
  console.log('Listening on ' + server.address().port);
});

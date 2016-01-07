const http = require('http');
const ws = require('ws');
const path = require('path');

const express = require('express');
const server = http.createServer();

const WebSocketServer = ws.Server;
const wss = new WebSocketServer({ server: server });

const app = express();

const appDir = path.dirname(require.main.filename);

app.get('/', (req, res) => {
  res.sendFile(appDir + '/static/index.html');
});

app.use('/dist', express.static('dist'));
app.use('/static', express.static('static'));

wss.on('connection', function connection(socket) {
  socket.on('message', function incoming(message) {
    console.error('received: %s', message);
    socket.send('Got it!');
  });

  socket.send('something2');
});

server.on('request', app);
server.listen(3000, () => {
  console.log('Listening on ' + server.address().port);
});

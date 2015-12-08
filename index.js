var http = require('http');
var url = require('url');
var ws = require('ws');

var express = require('express');
var server = http.createServer();

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: server })

var app = express();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/static/index.html');
});

app.use('/static', express.static('dist'));

wss.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    ws.send('Got it!');
  });

  ws.send('something');
});

server.on('request', app);
server.listen(3000, function() { 
	console.log('Listening on ' + server.address().port); 
});
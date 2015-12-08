function foo() {
	var socket = new WebSocket("ws://localhost:3000");
	socket.onmessage = (a) => {
		console.log("Got message",a.data);
	};	
	socket.onopen = (a) => {
		socket.send('ok');
	};
	
}

module.exports = {foo};
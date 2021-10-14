var zmq = require('zeromq');

var socket = zmq.socket('req');

socket.on('message', function(payload) {
	var data = payload.toString();
    console.log(data);
	// var response = {};
	// var keys = Object.keys(data);
	// for (var i = 0; i < keys.length; i++)
	// {
	// 	response[data[keys[i]]] = keys[i];
	// }
	
	// socket.send(JSON.stringify(response));
});

var endpoint = 'tcp://127.0.0.1:5555';
socket.connect(endpoint);
socket.send('action: 1,0'.toString('utf-8'));
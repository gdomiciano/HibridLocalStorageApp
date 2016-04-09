var WebSocketServer = require('websocket').server;
var http = require('http');
var webSocketsServerPort = 1337;
var clients = [];

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(webSocketsServerPort, function() { 
	console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});


// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
	clients.push(connection);
	console.log('conectou' + request.origin);
	
    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
		console.log((new Date()) + " New message: " + message.utf8Data);		
        if (message.type === 'utf8') {
            // process WebSocket message
			for (var i=0; i < clients.length; i++) {
				clients[i].sendUTF(message.utf8Data);
			}
        }
    });

    connection.on('close', function(connection) {
        // close user connection
		clients.splice(connection);
		console.log('desconectou' + connection);
    });
});
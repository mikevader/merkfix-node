var Merkfix = require('./public/js/memory.js').Merkfix,
    express = require('express'),
	app = express(),
    path = require('path'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
	games =  {};

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.use(express.bodyParser());
	app.use(express.static(path.join(__dirname, 'public')));
});  

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
}); 

server.listen(process.env.PORT || 3000);

io.sockets.on('connection', function (socket) {

	socket.on('createGame', function (json) {
		var gameId = json.gameName;
		games[gameId] = new Merkfix(json.numberOfPlayers, json.numberOfCards);
		socket.emit('gameCreated', true);
	});
	socket.on('join', function (gameId) {
		socket.on('play', function (index) {
			io.sockets.emit('update', games[gameId].rotateMemoryCard(index));
		});
		socket.on('reset', function () {
			io.sockets.emit('update', games[gameId].resetGame());
		});
		socket.emit('joined', games[gameId].status());
	});
});

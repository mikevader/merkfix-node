#!/bin/env node
var Merkfix = require('./public/js/memory.js').Merkfix,
    express = require('express'),
	app = express(),
    path = require('path'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
	games =  {};

app.configure(function(){
	app.use(express.static(path.join(__dirname, 'public')));
});  

server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000, process.env.OPENSHIFT_NODEJS_IP);

io.sockets.on('connection', function (socket) {

	function joinClient(gameId) {
		
		if (gameId === undefined || gameId === null || games[gameId] === undefined) {
			console.error("GameId is null, undefined or game does not exist");
			return;
		}
		socket.join(gameId); // Join Room
		
		socket.on('play', function (index) {
			console.info('Play ' + index);
			var token = games[gameId].game.rotateMemoryCard(index);
			io.sockets.in(gameId).emit('update', token);
			if (token.event === 'LOOSE_ROUND') {
				setTimeout(function() {
					io.sockets.in(gameId).emit('update', games[gameId].game.status());
				}, 3000);
			}
		});	
		socket.on('reset', function () {
			io.sockets.in(gameId).emit('update', games[gameId].game.resetGame());
		});
		socket.emit('joined', { 'joinerId' : games[gameId].joined++, 'numberOfCards' : games[gameId].numberOfCards});
	}

	socket.on('createGame', function (json) {
		games[json.gameName] =  {
			game : new Merkfix(json.numberOfPlayers, json.numberOfCards),
			joined : 0,
			players: json.numberOfPlayers,
			nrOfCards : json.numberOfCards
		};
		joinClient(json.gameName);
	});
	socket.on('join', joinClient);
});

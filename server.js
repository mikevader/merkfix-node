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
		socket.join(gameId);
		
		socket.on('play', function (index) {
			io.sockets.in(gameId).emit('update', games[gameId].rotateMemoryCard(index));
		});	
		socket.on('reset', function () {
			io.sockets.in(gameId).emit('update', games[gameId].resetGame());
		});
		
		socket.emit('joined', games[gameId].status());
	}

	socket.on('createGame', function (json) {
		games[json.gameName] = new Merkfix(json.numberOfPlayers, json.numberOfCards);
		joinClient(json.gameName);
	});
	
	socket.on('join', joinClient);
});

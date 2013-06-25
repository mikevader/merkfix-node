#!/bin/env node
var Merkfix = require('./public/js/memory.js').Merkfix,
    express = require('express'),
	app = express(),
    path = require('path'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
	games =  {};

app.configure(function(){
	app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
	app.use(express.bodyParser());
	app.use(express.static(path.join(__dirname, 'public')));
});  

/*
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});
*/ 

server.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP);

io.sockets.on('connection', function (socket) {

	console.log('------------------------\n CONNECTION \n------------------------ ');

	socket.on('c', function() {
		console.log('------------------------\n C WORKED \n------------------------ ');
	});
	
	socket.on('createGame', function (json) {
		
		var gameId = json.gameName;
		games[gameId] = new Merkfix(json.numberOfPlayers, json.numberOfCards);
		socket.emit('gameCreated', true);
	});
	socket.on('join', function (gameId) {
		console.log('game joined');
	
		socket.on('play', function (index) {
			io.sockets.emit('update', games[gameId].rotateMemoryCard(index));
		});
		socket.on('reset', function () {
			io.sockets.emit('update', games[gameId].resetGame());
		});
		socket.emit('joined', games[gameId].status());
	});
});

(function(global) {
	"use strict";
	var memory,
	gameId,
	clientId = 0,
	cardElements = document.querySelectorAll('.cardcontent'),
	playerColors = ['#ff0000', '#00ff00', '#0000ff'],
	ClientMemory = function(callback) {
		var merkfix = new Merkfix(2, 16);
		this.play = function(index) { callback(merkfix.rotateMemoryCard(index)); };
		this.reset = function() { callback(merkfix.resetGame()); }
	},
	ServerMemory = function(callback) {
		var socket = io.connect(document.location.protocol + '//' + document.location.hostname);
		function joinGame(id) {
			gameId = id;
			socket.on(gameId, function (data) {
				refresh(data);
			});
		};
		this.createGame = function(numberOfPlayers, gameName, numberOfCards) {
			 socket.on('gameCreated', function (data) {
				alert("Game created");
				joinGame(gameName);
			});
			socket.emit('createGame', { 'numberOfPlayers' : numberOfPlayers, 'gameName' : gameName, 'numberOfCards' : numberOfCards });
		};
		this.joinGame = joinGame;
		this.play = function(index) { 
			socket.emit('play', {gameId : gameId, index : index}); 
		};
		this.reset = function() { 
			socket.emit('reset', {gameId : gameId});
		}
	};

	function draw2(elm, key) {
		elm.classList.add('cardshow');
		elm.style.backgroundPositionX = key * 6.6666667 + '%';
	}
	function clear2(elm) {
		elm.classList.remove('cardshow');
	}
	
	function isInPaintArea(index) {
		return (clientId == 0 && index < 16) || (clientId == 1 && index >= 16);
	}
	
	function memoryIndexToElement(memoryIndex) {
	
		var result = (clientId == 1) ? memoryIndex - 16 : memoryIndex;
		console.log(result);
		return result;
	}
	
	function refresh(token) {
		console.log(JSON.stringify(token));
		var i, memorycards = token.memorycards,
		length = memorycards.length,
		elm;
			
		for (i = 0; i < length; i++) {
			if (!isInPaintArea(i)) {
				continue;
			}
			if (memorycards[i].rotated) {
				draw2(cardElements[memoryIndexToElement(i)], memorycards[i].key);
			} else {
				clear2(cardElements[memoryIndexToElement(i)]);
			}
		}
			 
		if (token.indexOfFirstRotated !== undefined && isInPaintArea(token.indexOfFirstRotated)) {
			draw2(cardElements[memoryIndexToElement(token.indexOfFirstRotated)], memorycards[token.indexOfFirstRotated].key);
		}
		if (token.indexOfSecondRotated !== undefined && isInPaintArea(token.indexOfSecondRotated)) {
			draw2(cardElements[memoryIndexToElement(token.indexOfSecondRotated)], memorycards[token.indexOfSecondRotated].key);
		}
		elm = document.getElementById('activePlayer');
		elm.style.backgroundColor =  playerColors[token.activePlayer];
		document.getElementById('title').innerHTML = 'P: ' + token.points;
	}
	function createClickHandler(index) {
		return function(e) {
			memory.play(index + clientId * 16);
		};
	};
	function toggleMenu() {
		document.getElementById('menu').classList.toggle('open');
	};
	function resetGame() {
		memory.reset();
		toggleMenu();
	};
	function newServerGame() {
		var numberOfPlayers = prompt('Anzahl Spieler');
		var gameName = prompt('Spielname');
		var numberOfCards = prompt('Anzahl Karten');
		if (numberOfCards !== '32') {
			numberOfCards = 16;
		}
		memory = new ServerMemory(refresh);
		memory.createGame(numberOfPlayers, gameName, numberOfCards);
		toggleMenu();
		clientId = 0;
	};
	function joinServerGame() {
		var gameId = prompt('Game-ID');
		memory = new ServerMemory(refresh);
		memory.joinGame(gameId);
		toggleMenu();
		clientId = 1;
	};
	function register(elm, func) {
		var eventType = ('ontouchstart' in window) ? 'touchstart' : 'click';
		elm.addEventListener(eventType, func, true);
	};
	(function init() {
		var i, allCardElements = document.querySelectorAll('#playground .cardcontent');
		for (i = 0; i < allCardElements.length; i++) { register(allCardElements[i], createClickHandler(i))};
		register(document.getElementById('menubar'), toggleMenu);
		register(document.getElementById('newgamebutton'), resetGame);
		register(document.getElementById('newservergame'), newServerGame);
		register(document.getElementById('joinservergame'), joinServerGame);
		register(document, function(e) {e.preventDefault();});
		memory = new ClientMemory(refresh);
	})();
})(window);


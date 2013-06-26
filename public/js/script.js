(function(global) {
	"use strict";
	var memory,
	clientId = 0,
	cardElements = document.querySelectorAll('.cardcontent'),
	playerColors = ['#ff0000', '#00ff00', '#0000ff', '#00ffff', '#ffff00', '#ff00ff'],
	ClientMemory = function(callback) {
		var merkfix = new Merkfix(2, 16);
		this.play = function(index) { callback(merkfix.rotateMemoryCard(index)); };
		this.reset = function() { callback(merkfix.resetGame()); }
	},
	ServerMemory = function(callback) {
		var port = document.location.port === '3000' ? '3000' : '8000',
		socket = io.connect(document.location.protocol + '//' + document.location.hostname + ':' + port);
		socket.on('update', refresh);
		socket.on('joined', function(token) {
			if (token['memorycards'].length == 16) {
				clientId = 0;
			}
		});
		this.createGame = function(numberOfPlayers, gameName, numberOfCards) {
			socket.emit('createGame', { 
				'numberOfPlayers' : numberOfPlayers,
				'gameName' : gameName, 
				'numberOfCards' : numberOfCards 
			});
		};
		this.joinGame = function (gameId) {
			socket.emit('join', gameId);
		};
		this.play = function(index) { 
			socket.emit('play', index); 
		};
		this.reset = function() { 
			socket.emit('reset', {});
		}
	};
	function swap(index1, index2) {
		var elm1 = cardElements[index1], 
		elm2 = cardElements[index2],
		rowElm1 = Math.floor(index1 / 4),
		rowElm2 = Math.floor(index2 / 4),
		colElm1 = index1 % 4,
		colElm2 = index2 % 4;
		
		
		elm1.style.webkitTransform = 'translateX(' + ((colElm2 - colElm1) * 100) + '%) translateY(' + ((rowElm2 - rowElm1) * 100) + '%)';
		elm2.style.webkitTransform = 'translateX(' + ((colElm1 - colElm2) * 100) + '%) translateY(' + ((rowElm1 - rowElm2) * 100) + '%)';
		
	}
	function shuffleAnimation() {
		var array = new Array(16), i;
		for (i = 0; i < array.length; i++) {
			array[i] = i;
		}
		for(var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
		for(i = 0; i < array.length; i+= 2) {
			swap(array[i], array[i + 1]);
		}
	}
	function draw(elm, key) {
		elm.querySelector('.photo').style.backgroundPositionX = key * 6.6666667 + '%';
		elm.classList.add('active');
	}
	function clear(elm) { 
		elm.classList.remove('active');
	}
	function isInPaintArea(index) {
		return (clientId == 0 && index < 16) || (clientId == 1 && index >= 16);
	}
	function memoryIndexToElement(memoryIndex) {
		return (clientId == 1) ? memoryIndex - 16 : memoryIndex;
	}
	function showCardIfDefined(index, memorycards) {
		if (index !== undefined && isInPaintArea(index)) {
			draw(cardElements[memoryIndexToElement(index)], memorycards[index].key);
		}
	}
	function refresh(token) {
		var i, memorycards = token.memorycards,
		length = memorycards.length,
		firstRotated = token.indexOfFirstRotated,
		secondRotated = token.indexOfSecondRotated,
		elm;
			
		for (i = 0; i < length; i++) {
			if (!isInPaintArea(i)) {
				continue;
			}
			if (memorycards[i].rotated) {
				draw(cardElements[memoryIndexToElement(i)], memorycards[i].key);
			} else {
				clear(cardElements[memoryIndexToElement(i)]);
			}
		}	
		showCardIfDefined(firstRotated, memorycards);
		showCardIfDefined(secondRotated, memorycards);

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
		shuffleAnimation();
	};
	function newServerGame() {
		var numberOfPlayers = prompt('Anzahl Spieler', 2);
		var gameName = prompt('Spielname', 'mab');
		var numberOfCards = prompt('Anzahl Karten', 16);
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
		clientId = 1; // Hack :-(
		memory = new ServerMemory(refresh);
		memory.joinGame(gameId);
		toggleMenu();
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


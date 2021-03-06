var Merkfix = function(nrOfPlayers, numberOfCards) {
	var memorycards,
	indexOfFirstRotated, 
	indexOfSecondRotated,
	activePlayer = 0,
	numberOfPlayers = parseInt(nrOfPlayers),
	points = new Array(numberOfPlayers);
	
	function createState(event) {
		return { 
			'event' : event,
			'indexOfFirstRotated' : indexOfFirstRotated,
			'indexOfSecondRotated' : indexOfSecondRotated,
			'memorycards' : memorycards,
			'activePlayer' : activePlayer,
			'points' : points
		};
	};
	function shuffleArray(array) {
		for(var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x); 
	}
	function init(numberOfCards) { 
		var i;
		memorycards = new Array(numberOfCards);
		indexOfFirstRotated = undefined;
		indexOfSecondRotated = undefined;
		for (i = 0; i < numberOfCards; i++) { 
			memorycards[i] = { 
				key : i % (numberOfCards / 2),
				rotated : false
			};
		};
		for (i = 0; i < points.length; i++) {
			points[i] = 0;
		}
		shuffleArray(memorycards);
		return createState('init');
	};
	function isFirstCard() {
		return indexOfFirstRotated === undefined && indexOfSecondRotated === undefined || indexOfFirstRotated !== undefined && indexOfSecondRotated != undefined;
	}
	function isCardNotPlayable(index) {
		return (indexOfFirstRotated !== undefined && index === indexOfFirstRotated) ||  (memorycards[index].rotated);
	};
	this.rotateMemoryCard = function(index) {
		var event, token;
		if (isCardNotPlayable(index)) { 
			return createState('NOT_PLAYABLE');
		} else if (isFirstCard()){
			event = 'FIRST_CARD';
			indexOfFirstRotated = index;
			indexOfSecondRotated = undefined;
			return createState(event);
		} else {
			indexOfSecondRotated = index;
			if (memorycards[indexOfFirstRotated].key === memorycards[indexOfSecondRotated].key) {
				memorycards[indexOfFirstRotated].rotated = true;
				memorycards[indexOfSecondRotated].rotated = true;
				event = 'WIN_ROUND';
				points[activePlayer] = points[activePlayer] + 1;
				token = createState(event);
			} else {
				event = 'LOOSE_ROUND';
				token = createState(event);
				activePlayer = (activePlayer + 1) % numberOfPlayers;
			}
			indexOfFirstRotated = undefined;
			indexOfSecondRotated = undefined;
			return token;
		}
	};
	this.resetGame = function() {
		return init(numberOfCards);
	};
	this.status = function() {
		return createState('STATUS');
	}
	init(numberOfCards);
};
// To use inside node.js and as standalone.
if (typeof exports !== 'undefined') {
	exports.Merkfix = Merkfix;
}
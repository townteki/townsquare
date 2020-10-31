//const _ = require('underscore');
const uuid = require('uuid');
const logger = require('../log.js');
/**
 * Base class representing a location on the game board.
 */
class GameLocation {
    constructor(location, order) {
        //Passed in location for construction. Card uuid is main identifier.
        this.uuid = location;
        this.adjacencyMap = new Map();
        /*Keeps track of location order on player street
          for flexbox order parameter info
          0 === outfit (on street) or townsquare
          >=1 === right of outfit
          <=-1 === left of outfit
        */
		logger.info("bla");
        this.order = order;
    }

    isAdjacent(uuid) {
        for(var key of this.adjacencyMap.keys()) {
            if(uuid === key) {
                return true;
            }
        }

        return false;
    }

    attach(uuid, direction) {
        this.adjacencyMap.set(uuid, direction);
    }

    detach(uuid) {
        this.adjacencyMap.delete(uuid);
    }

    adjacent() {
        return this.adjacencyMap;
    }

    left() {
        for(var [key,value] of this.adjacencyMap.entries()) {
            if(value === 'left') {
                return key;
            }
        }
    }

    right() {
        for(var [key,value] of this.adjacencyMap.entries()) {
            if(value === 'right') {
                return key;
            }
        }
    }

    /* Considering removing card state and mapping only between some identifier
       and each card's card.location parameter

    addCard(card) {
        if(!card) {
            return;
        }

        this.cards.push(card);
    }

    removeCard(card) {
        if(!card || !this.cards.includes(card)) {
            return;
        }

        this.cards = _(this.cards.reject(c => c === card));
    }

    cards() {
        return this.cards;
    }*/

}

/**
 * Singleton class representing the Town Square.
 * Generates with its own ID and at order 0 in the
 * central game flex box
 */
class TownSquare extends GameLocation {
    constructor() {
        super(uuid.v1(), 0);

        this.key = 'townsquare';
    }

    north() {
        for(var [key,value] of this.adjacencyMap.entries()) {
            if(value === 'north') {
                return key;
            }
        }
    }

    south() {
        for(var [key,value] of this.adjacencyMap.entries()) {
            if(value === 'south') {
                return key;
            }
        }
    }
}


module.exports = GameLocation;

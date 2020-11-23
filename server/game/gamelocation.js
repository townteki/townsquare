const _ = require('underscore');
const { TownSquareUUID } = require('./Constants');

/**
 * Base class representing a location on the game board.
 */
class GameLocation {
    constructor(locationCard, neighbourLocation, order) {
        //Passed in location for construction. Card uuid is main identifier.
        this.uuid = locationCard.uuid;
        if (this.uuid !== TownSquareUUID) {
            this.modifiedAdjacentLocations = locationCard.modifiedAdjacentLocations();
        }
        this.adjacencyMap = new Map();
        /*Keeps track of location order on player street
          for flexbox order parameter info
          0 === outfit (on street) or townsquare
          >=1 === right of outfit
          <=-1 === left of outfit
        */
        this.order = order;
        if (neighbourLocation) {
            this.attach(neighbourLocation.uuid);
            neighbourLocation.attach(this.uuid);
        }
        if (order != null) {
            this.attach(locationCard.game.townsquare.uuid, 'townsquare');
            locationCard.game.townsquare.attach(this.uuid);
        }
        this.occupants = [];
    }

    getLocationCard(game) {
        return game.findCardInPlayByUuid(this.uuid);
    }

    isAdjacent(uuid) {
        for(var key of this.adjacencyMap.keys()) {
            if(uuid === key) {
                return true;
            }
        }

        return false;
    }

    isTownSquare() {
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

    addDude(card) {
        if(!card || card.getType() !== 'dude') {
            return;
        }
        card.updateGameLocation(this.uuid);
        this.occupants.push(card.uuid);
    }

    removeDude(card) {
        if(!card || !this.occupants.includes(card.uuid)) {
            return;
        }
        card.gamelocation = null;
        this.occupants = _.reject(this.occupants, c => c === card.uuid);
    }

}

/**
 * Singleton class representing the Town Square.
 * Generates with its own ID and at order 0 in the
 * central game flex box
 */
class TownSquare extends GameLocation {
    constructor() {
        // TODO M2 probably will have to create town square card since it is possible to
        // attach to town square
        super({ uuid: TownSquareUUID}, null, null);

        this.key = 'townsquare';
    }

    isTownSquare() {
        return true;
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


module.exports = {
    GameLocation: GameLocation,
    TownSquare: TownSquare
}

const _ = require('underscore');
const { TownSquareUUID } = require('./Constants');
const NullCard = require('./nullcard');

/**
 * Base class representing a location on the game board.
 */
class GameLocation {
    constructor(game, locationCard, neighbourLocation, order) {
        this.game = game;
        this.card = locationCard;
        this.adjacencyMap = new Map();
        /*Keeps track of location order on player street
          for flexbox order parameter info
          0 === outfit (on street) or townsquare
          >=1 === right of outfit
          <=-1 === left of outfit
        */
        this.order = order;
        if(neighbourLocation) {
            this.addAdjacency(neighbourLocation, 'game');
        }
        if(order !== null && order !== undefined) {
            this.addAdjacency(this.game.townsquare, 'game');
        }
        if(locationCard.defaultAdjacencyEffects) {
            locationCard.defaultAdjacencyEffects.forEach(adjacencyEffect => 
                this.addAdjacency(adjacencyEffect.location, adjacencyEffect.source, adjacencyEffect.type));
        }
        this.occupants = [];
        locationCard.gameLocationObject = this;
    }

    get locationCard() {
        return this.card;
    }

    set locationCard(card) {
        this.card = card;
    }

    get uuid() {
        return this.locationCard.uuid;
    }

    determineController() {
        if(this.isTownSquare()) {
            // TODO M2 Harry Highbinder can control townsquare, needs to be implemented
            return;
        }
        let playersStats = new Map();
        let originalController = this.locationCard.controllingPlayer;
        let playerWithMost = this.locationCard.owner;
        let currentController = this.locationCard.owner;
        let defaultDeterminator = this.locationCard.controlDeterminator;
        playersStats.set(this.locationCard.owner.name, 0);
        playersStats.set(this.locationCard.controllingPlayer.name, 0);
        this.occupants.forEach(dudeUuid => {
            let dude = this.game.findCardInPlayByUuid(dudeUuid);
            let determinator = defaultDeterminator;
            if(dude.controlDeterminator !== 'influence:deed') {
                determinator = dude.controlDeterminator;
            }
            let amount = dude.getStat(determinator);
            if(amount > 0) {
                let currentAmount = playersStats.get(dude.controller.name) || 0;
                playersStats.set(dude.controller.name, currentAmount + amount);
                if(dude.controller.name === playerWithMost.name) {
                    currentController = dude.controller;
                } else if(playersStats.get(dude.controller.name) > playersStats.get(playerWithMost.name)) {
                    playerWithMost = dude.controller;
                    currentController = dude.controller;
                } else if(playersStats.get(dude.controller.name) === playersStats.get(playerWithMost.name)) {
                    currentController = this.locationCard.owner;
                }
            }
        });
        if(currentController !== originalController) {
            if(currentController !== this.locationCard.owner) {
                this.game.addAlert('info', '{0} broke into {1} and has taken control from the {2}.', currentController, this.locationCard, originalController);
            } else {
                this.game.addAlert('info', '{0} has wrestled control of {1} back from {2}.', currentController, this.locationCard, originalController);
            }
        }
        return currentController;
    }

    isAdjacent(uuid) {
        let adjacency = this.adjacencyMap.get(uuid);
        if(!adjacency) {
            return false;
        }

        if(adjacency[0].type === 'adjacent') {
            return true;
        }
    }

    isTownSquare() {
        return false;
    }

    isHome(player) {
        return this.locationCard && this.locationCard.getType() === 'outfit' && this.locationCard.owner === player;
    }

    addAdjacency(location, source, type = 'adjacent') {
        this.attach(location.uuid, source, type);
        location.attach(this.locationCard.uuid, source, type);
    }

    removeAdjacency(location, source, type = 'adjacent') {
        this.detach(location.uuid, source, type);
        location.detach(this.locationCard.uuid, source, type);
    }

    attach(uuid, source, type) {
        let adjacency = this.adjacencyMap.get(uuid) || [];
        adjacency.unshift({ source: source, type: type });
        this.adjacencyMap.set(uuid, adjacency);
    }

    detach(uuid, source, type) {
        let adjacency = this.adjacencyMap.get(uuid);
        if(!adjacency) {
            return;
        }
        adjacency = adjacency.filter(adjItem => adjItem.source !== source && adjItem.type !== type);
        if(adjacency.length === 0) {
            this.adjacencyMap.delete(uuid);
        } else {
            this.adjacencyMap.set(uuid, adjacency);
        }  
    }

    addDude(card) {
        if(!card || card.getType() !== 'dude') {
            return;
        }
        card.updateGameLocation(this.locationCard.uuid);
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
    constructor(game) {
        // TODO M2 probably will have to create town square card since it is possible to
        // attach to town square
        super(game, Object.assign(new NullCard(), {
            title: 'Town Square', 
            uuid: TownSquareUUID,
            getType: () => 'townsquare',
            getLocation: () => this,
            gamelocation: 'townsquare'
        }), null, null);

        this.key = 'townsquare';
    }

    isTownSquare() {
        return true;
    }

    north() {
        for(var [key, value] of this.adjacencyMap.entries()) {
            if(value === 'north') {
                return key;
            }
        }
    }

    south() {
        for(var [key, value] of this.adjacencyMap.entries()) {
            if(value === 'south') {
                return key;
            }
        }
    }
}

module.exports = {
    GameLocation: GameLocation,
    TownSquare: TownSquare
};

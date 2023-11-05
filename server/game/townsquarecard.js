const { TownSquareUUID } = require('./Constants');
const NullCard = require('./nullcard');

class TownsquareCard extends NullCard {
    constructor(game) {
        super();
        this.game = game;
        this.title = 'Town Square';
        this.uuid = TownSquareUUID;
        this.location = 'play area';
        this.gamelocation = 'townsquare';
    }
    
    getType() {
        return 'townsquare';
    }

    getGameLocation() {
        return this.game.townsquare;
    }

    isAdjacent(targetUuid) {
        return this.game.townsquare.isAdjacent(targetUuid);
    }

    isNearby(targetUuid) {
        return this.gamelocation === targetUuid || this.isAdjacent(targetUuid);
    }

    isOutOfTown() {
        return false;
    }

    isPublic() {
        return true;
    }

    isPrivate() {
        return false;
    }

    isLocationCard() {
        return true;
    }

    adjacentLocations() { 
        return this.game.filterCardsInPlay(card => card.isLocationCard() && this.isAdjacent(card.uuid))
            .map(card => card.getGameLocation());
    }

    getShortSummary() {
        return {
            code: 'townsquare',
            title: 'Town Square',
            type: 'townsquare'
        };
    }
}

module.exports = TownsquareCard;

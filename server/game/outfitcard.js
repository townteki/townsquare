const LocationCard = require('./locationcard.js');

class OutfitCard extends LocationCard {
    get controller() {
        return this.owner;
    }

    isPrivate() {
        return true;
    }

    isOutOfTown() {
        return false;
    }
}

module.exports = OutfitCard;

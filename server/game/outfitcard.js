const LocationCard = require('./locationcard.js');

class OutfitCard extends LocationCard {
    get controller() {
        return this.owner;
    }

    isPrivate() {
        return true;
    }

    isPublic() {
        return false;
    }

    isOutOfTown() {
        return false;
    }
}

module.exports = OutfitCard;

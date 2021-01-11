const DrawCard = require('./drawcard.js');

class OutfitCard extends DrawCard {

    get controller() {
        return this.owner;
    }

    isPrivate() {
        return true;
    }

    isOutofTown() {
        return false;
    }

}

module.exports = OutfitCard;

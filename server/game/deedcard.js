const LocationCard = require('./locationcard.js');

class DeedCard extends LocationCard {
    get controller() {
        if(this.location === 'play area' && this.gameLocationObject) {
            this.controller = this.gameLocationObject.determineController();
        }
        return this.controllingPlayer;
    }

    set controller(controller) {
        this.controllingPlayer = controller;
    }

    isPrivate() {
        return this.hasKeyword('Private');
    }

    isPublic() {
        return this.hasKeyword('Public');
    }

    isSameStreet(card) {
        if(this.isOutOfTown()) {
            return false;
        }
        if(card.getType() === 'deed' && card.isOutOfTown()) {
            return false;
        }
        if(card.getType() === 'outfit' && card.owner === this.owner) {
            return true;
        }
        return this.owner.locations.some(location => location.uuid === card.uuid);
    }
}

module.exports = DeedCard;

const LocationCard = require('./locationcard.js');

class DeedCard extends LocationCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.controlDeterminator = 'influence:deed';
    }

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

    isOutOfTown() {
        return this.hasKeyword('Out of Town');
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

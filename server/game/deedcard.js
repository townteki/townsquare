const DrawCard = require('./drawcard.js');

class DeedCard extends DrawCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.controlDeterminator = 'influence:deed';
        this.gameLocationObject = null;
    }

    get controller() {
        if (this.location === 'play area' && this.gameLocationObject) {
            this.controller = this.gameLocationObject.determineController(this.game);
        }
        return this.controllingPlayer;
    }

    set controller(controller) {
        this.controllingPlayer = controller;
    }

    leavesPlay() {
        super.leavesPlay();
        this.gameLocationObject = null;
    }

    isPrivate() {
        return this.hasKeyword('Private');
    }

    isOutofTown() {
        return this.hasKeyword('Out of Town');
    }

    receiveProduction(player) {
        if (player === this.owner) {
            return this.production;
        }
        return 0;
    }

}

module.exports = DeedCard;

const _ = require('underscore');

const DrawCard = require('./drawcard.js');

class DeedCard extends DrawCard {
    isPrivate() {
        return this.hasKeyword('Private');
    }

    isOutofTown() {
        return this.hasKeyword('Out of Town');
    }
}

module.exports = DeedCard;

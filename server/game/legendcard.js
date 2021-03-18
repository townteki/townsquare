const DrawCard = require('./drawcard.js');

class LegendCard extends DrawCard {
    get controller() {
        return this.owner;
    }

    isUnique() {
        return true;
    }

    canAttach(targetCard) {
        return targetCard.getType() === 'outfit' && this.owner === targetCard.owner;
    }
}

module.exports = LegendCard;

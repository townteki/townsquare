const DrawCard = require('./drawcard.js');

class LegendCard extends DrawCard {
    get controller() {
        return this.owner;
    }

    isUnique() {
        return true;
    }

    canAttach(player, targetCard) {
        return targetCard.getType() === 'outfit' && 
            this.owner.equals(player) && 
            !targetCard.hasAttachment(attachment => attachment.getType() === 'legend');
    }
}

module.exports = LegendCard;

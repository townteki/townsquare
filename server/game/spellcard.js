const HeartsCard = require('./heartscard.js');

class SpellCard extends HeartsCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.canTrade = false;
    }

    canAttach(player, card) {
        if(!super.canAttach(player, card)) {
            return false;
        }
        if(card.getType() === 'dude') {
            if(card.hasKeyword('Huckster') && this.isHex()) {
                return true;
            } else if(card.hasKeyword('Blessed') && this.isMiracle()) {
                return true;
            } else if(card.hasKeyword('Shaman') && this.isSpirit()) {
                return true;
            }
        } else if(card.isLocationCard() && this.isTotem()) {
            return card.controller === this.controller && 
                card.getGameLocation().getDudes().find(dude => dude.hasKeyword('shaman') && !dude.booted);
        }
    }
}

module.exports = SpellCard;

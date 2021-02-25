const GoodsCard = require('./goodscard.js');

class SpellCard extends GoodsCard {
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
            return true;
        }
    }
}

module.exports = SpellCard;

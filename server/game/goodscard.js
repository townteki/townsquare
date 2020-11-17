const _ = require('underscore');

const DrawCard = require('./drawcard.js');

class GoodsCard extends DrawCard {
    constructor(owner, cardData) {
        super(owner, cardData);

        this.traded = false;
    }

    canAttach(player, card) {
        if (!super.canAttach(player, card)) {
            return false;
        }

        if(card.getType() === 'dude') {
            if (this.hasKeyword('weapon') && !card.canAttachWeapon(this)) {
                return false;
            } 
            if (this.hasKeyword('horse') && !card.canAttachHorse(this)) {
                return false;
            }
            if (this.hasKeyword('attire') && !card.canAttachAttire(this)) {
                return false;
            }

            return true;
        }

        if (card.getType() === 'deed') {
            if (!this.hasKeyword('improvement')) {
                return false
            }
            return true;
        }        

        return false;
    }

    wasTraded() {
        return this.traded;
    }

}

module.exports = GoodsCard;

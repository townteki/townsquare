const _ = require('underscore');

const DrawCard = require('./drawcard.js');

class SpellCard extends DrawCard {
    canAttach(player, card) {
        if(card.getType() === 'dude') {
            if(card.hasKeyword('Huckster') && this.isHex()) {
                return true;
            } else if(card.hasKeyword('Blessed') && this.isMiracle()) {
                return true;
            } else if(card.hasKeyword('Shaman') && this.isSpirit()) {
                return true;
            }
        } else if((card.getType() === 'deed' || card.getType() === 'outfit') && this.isTotem()) {
            return true;
        }
    }

    isHex() {
        return this.hasKeyword('Hex');
    }

    isMiracle() {
        return this.hasKeyword('Miracle');
    }

    isSpirit() {
        return this.hasKeyword('Spirit');
    }

    isTotem() {
        return this.hasKeyword('Totem');
    }
}

module.exports = SpellCard;

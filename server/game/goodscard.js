const DrawCard = require('./drawcard.js');

class GoodsCard extends DrawCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.traded = false;
        this.canTrade = true;
        this.resetHandler = () => this.reset();
    }

    get difficulty() {
        return this.keywords.getDifficulty();
    }

    canAttach(player, card, playingType) {
        if(!super.canAttach(player, card)) {
            return false;
        }

        if(this.isGadget() && playingType === 'shoppin' && !card.hasKeyword('mad scientist')) {
            return false;
        }

        if(card.getType() === 'dude') {
            if(this.hasKeyword('weapon') && !card.canAttachWeapon(this)) {
                return false;
            } 
            if(this.hasKeyword('horse') && !card.canAttachHorse(this)) {
                return false;
            }
            if(this.hasKeyword('attire') && !card.canAttachAttire(this)) {
                return false;
            }

            return true;
        }

        if(card.getType() === 'deed') {
            if(!this.hasKeyword('improvement')) {
                return false;
            }
            return true;
        }        

        return false;
    }

    canBeTraded() {
        return this.canTrade;
    }

    wasTraded() {
        return this.traded;
    }

    entersPlay() {
        this.game.on('onRoundEnded', this.resetHandler);
    }

    leavesPlay() {
        this.game.removeListener('onRoundEnded', this.resetHandler);
    }

    reset() {
        this.traded = false;
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

    isGadget() {
        return this.hasKeyword('Gadget');
    }
}

module.exports = GoodsCard;

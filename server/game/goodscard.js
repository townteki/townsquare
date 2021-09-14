const HeartsCard = require('./heartscard.js');

class GoodsCard extends HeartsCard {
    canAttach(player, card, playingType) {
        if(!super.canAttach(player, card, playingType)) {
            return false;
        }

        if(this.isImprovement()) {
            return card.getType() === 'deed' || card.getType() === 'outfit';
        }

        if(this.isGadget() && playingType === 'shoppin' &&
            (!card.hasKeyword('mad scientist') || card.cannotInventGadgets())) {
            return false;
        }   

        return card.getType() === 'dude';
    }
}

module.exports = GoodsCard;

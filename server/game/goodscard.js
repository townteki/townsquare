const PlayingTypes = require('./Constants/PlayingTypes.js');
const HeartsCard = require('./heartscard.js');

class GoodsCard extends HeartsCard {
    canAttach(player, card, playingType) {
        if(!super.canAttach(player, card, playingType)) {
            return false;
        }

        if(this.isImprovement()) {
            return card.getType() === 'deed' || card.getType() === 'outfit';
        }

        if(card.getType() !== 'dude') {
            return false;
        }

        if(this.isGadget() && playingType === PlayingTypes.Shoppin &&
            (!card.canPerformSkillOn(this) || card.cannotInventGadgets())) {
            return false;
        }

        return true;
    }
}

module.exports = GoodsCard;

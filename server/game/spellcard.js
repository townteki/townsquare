const AbilityDsl = require('./abilitydsl.js');
const HeartsCard = require('./heartscard.js');

class SpellCard extends HeartsCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.canTrade = false;
        if(this.isTotem()) {
            this.persistentEffect({
                match: this,
                effect: AbilityDsl.effects.canUseControllerAbilities(this, () => true),
                fromTrait: false
            });
        }        
    }

    canAttach(player, card, playingType) {
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
            if(['validityCheck', 'chatcommand'].includes(playingType)) {
                return true;
            }
            return card.controller === this.controller && 
                this.game.getDudesAtLocation(card.gamelocation).find(dude => dude.hasKeyword('shaman') && !dude.booted);
        }
        return false;
    }

    isSpell() {
        return true;
    }
}

module.exports = SpellCard;

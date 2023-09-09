const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class RogerWilcox extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.cannotAttachCards(this, attachment => 
                attachment.hasKeyword('gadget'))
        });        
        this.persistentEffect({
            condition: () => this.isGadgetInThisLocation(),
            match: this,
            effect: [
                ability.effects.modifyBullets(2)
            ]
        });
    }

    isGadgetInThisLocation() {
        return this.game.getNumberOfCardsInPlay(card => card.hasKeyword('gadget') && card.gamelocation === this.gamelocation) > 0;
    }    
}

RogerWilcox.code = '25008';

module.exports = RogerWilcox;

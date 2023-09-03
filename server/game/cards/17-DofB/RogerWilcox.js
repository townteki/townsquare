const DudeCard = require('../../dudecard.js');

class RogerWilcox extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.cannotAttachCards(this, attachment => 
                attachment.hasKeyword('gadget'))
        });        
        this.persistentEffect({
            condition: () => true,
            match: this,
            effect: [
                ability.effects.dynamicBullets(() => this.getGadgetsInThisLocation())
            ]
        });
    }

    getGadgetsInThisLocation() {
        const numOfGadgets = this.game.getNumberOfCardsInPlay(card => card.hasKeyword('gadget') && card.gamelocation === this.gamelocation);
        return numOfGadgets > 4 ? 4 : numOfGadgets;
    }    
}

RogerWilcox.code = '25008';

module.exports = RogerWilcox;

const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MongwauTheMighty extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Mongwau the Mighty',
            playType: ['shootout'],
            cost: ability.costs.discardFromPlay(card => 
                this.equals(card.parent) &&
                card.hasKeyword('hex')),
            message: context => 
                this.game.addMessage('{0} uses {1} and discards {2} to make him a stud', 
                    context.player, this, context.costs.discardFromPlay),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
            }
        });
    }
}

MongwauTheMighty.code = '01006';

module.exports = MongwauTheMighty;

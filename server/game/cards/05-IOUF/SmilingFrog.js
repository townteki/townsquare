const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class SmilingFrog extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Smiling Frog',
            playType: ['noon'],
            cost: ability.costs.discardFromHand(),
            message: context => 
                this.game.addMessage('{0} uses {1} and discards {2} to give himself +{3} bullets', 
                    context.player, this, context.costs.discardFromHand, context.costs.discardFromHand.hasKeyword('spirit') ? 2 : 1),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.modifyBullets(context.costs.discardFromHand.hasKeyword('spirit') ? 2 : 1)
                }));
            }
        });
    }
}

SmilingFrog.code = '09026';

module.exports = SmilingFrog;

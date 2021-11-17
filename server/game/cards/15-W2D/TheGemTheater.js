const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TheGemTheater extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: The Gem Theatre',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            ifCondition: () => this.game.shootout && this.game.shootout.shootoutLocation.uuid === this.uuid,
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but it does not have any effect because shootout is not taking place there', 
                    context.player, this),
            message: context => this.game.addMessage('{0} uses {1} to make all dudes in a shootout draws', 
                context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.game.shootout.getParticipants(),
                    effect: ability.effects.setAsDraw()
                }));
            }
        });
    }
}

TheGemTheater.code = '23032';

module.exports = TheGemTheater;

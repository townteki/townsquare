const ActionCard = require('../../actioncard.js');
const PhaseNames = require('../../Constants/PhaseNames.js');

class LadyLuck extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Lady Luck',
            playType: ['noon'],
            message: context => this.game.addMessage('{0} plays {1}', context.player, this),
            handler: context => {
                this.untilEndOfPhase(context.ability, ability => ({
                    match: context.player,
                    effect: ability.effects.modifyNightfallDiscard(54)
                }), PhaseNames.Nightfall
                );
            }
        });
    }
}

LadyLuck.code = '01107';

module.exports = LadyLuck;

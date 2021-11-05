const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FiddleGame extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.modifyProduction(2)
        });

        this.traitReaction({
            ignoreActionCosts: true,
            location: 'play area',
            when: {
                onCardAbilityResolved: event => event.context.player !== this.controller &&
                    event.ability.isCardAbility() &&
                    event.ability.playTypePlayed() === 'cheatin resolution'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: this }), context).thenExecute(() => {
                    this.game.addMessage('{0} discards {1} because a Cheatin\' Resolution was used against them', 
                        context.player, this, context.target);
                });
            }
        });

        this.job({
            title: 'Noon: Fiddle Game',
            playType: 'noon',
            cost: ability.costs.bootLeader(),
            target: 'currentHome',
            message: context => 
                this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                context.player.attach(this, context.player.getOutfitCard(), 'ability', () => {
                    this.game.addMessage('{0} attaches {1} to their home', context.player, this, context.target);
                });
            }
        });
    }
}

FiddleGame.code = '14033';

module.exports = FiddleGame;

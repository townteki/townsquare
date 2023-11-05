const GoodsCard = require('../../goodscard.js');
const PhaseNames = require('../../Constants/PhaseNames.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class JaccsFailSafe extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.game.currentPhase === PhaseNames.Upkeep,
            effect: [
                ability.effects.modifyInfluence(2)
            ]
        });

        this.job({
            title: 'Ace Jacc to ace target',
            playType: 'noon',
            cost: ability.costs.bootParent(),
            target: {
                activePromptTitle: 'Select dude to blow up',
                cardCondition: { location: 'play area', controller: 'opponent' },
                cardType: 'dude'
            },
            message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),         
            onSuccess: (job, context) => {
                this.game.promptForYesNo(context.player, {
                    title: `Do you want to ace ${job.leader.title} to ace ${job.mark.title}?`,
                    onYes: player => {
                        this.game.resolveGameAction(GameActions.aceCard({ card: job.leader }), context).thenExecute(() => {
                            this.game.resolveGameAction(GameActions.aceCard({ card: job.mark }), context).thenExecute(() => {
                                this.game.addMessage('{0} used {1} and aced {2} to ace {3}', player, this, job.leader, job.mark);
                            });
                        });                     
                    },
                    onNo: player => {
                        this.game.addMessage('{0} used {1}, but decides not to ace {2} to ace {3}', player, this, job.leader, job.mark);
                    },
                    source: this
                });
            }
        });
    }
}

JaccsFailSafe.code = '25039';

module.exports = JaccsFailSafe;

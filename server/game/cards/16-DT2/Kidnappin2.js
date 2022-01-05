const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Kidnappin2 extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.job({
            title: 'Kidnappin\'',
            playType: 'noon',
            cost: ability.costs.bootLeader(),
            target: {
                activePromptTitle: 'Select dude to kidnap',
                cardCondition: { location: 'play area', controller: 'opponent' },
                cardType: 'dude'
            },
            posseCondition: (job, posseSelection) =>
                job.leader.bullets + posseSelection.reduce((agg, dude) => agg + dude.bullets, 0) > job.mark.bullets,
            message: context =>
                this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            handler: context => {
                const eventHandler = event => 
                    this.game.resolveGameAction(GameActions.addBounty({ card: event.card }), context);
                this.game.on('onDudeJoinedPosse', eventHandler);
                this.game.once('onShootoutPhaseFinished', () => {
                    this.game.removeListener('onDudeJoinedPosse', eventHandler);
                });
            },
            onSuccess: (job, context) => {
                if(this.game.discardFromPlay([job.mark], true, () => true, { isCardEffect: true }, context)) {
                    this.game.addMessage('{0} discards {1} as a result of the {2}', context.player, job.mark, this);
                }
            }
        });
    } 
}

Kidnappin2.code = '24235';

module.exports = Kidnappin2;

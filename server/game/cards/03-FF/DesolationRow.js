const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DesolationRow extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: card => card.getType() === 'dude' && card.bounty >= 4,
            effect: ability.effects.modifyControl(1)
        });
        this.job({
            title: 'Noon: Desolation Row',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: 'townsquare',
            message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                if(job.leader.isParticipating()) {
                    this.game.resolveGameAction(GameActions.addBounty({ card: job.leader, amount: 2 }), context);
                    const reward = job.leader.bullets > 4 ? 4 : job.leader.bullets;
                    context.player.modifyGhostRock(reward);
                    this.game.addMessage('{0} gives {1} 2 bounty and gains {2} GR as a result of {3} job', 
                        context.player, job.leader, reward, this);
                }
            }
        });
    }
}

DesolationRow.code = '05004';

module.exports = DesolationRow;

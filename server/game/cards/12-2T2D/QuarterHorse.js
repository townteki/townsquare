const GoodsCard = require('../../goodscard.js');

class QuarterHorse extends GoodsCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Quarter Horse',
            triggerBefore: true,
            when: {
                onDudesReturnAfterJob: event => event.job.jobSuccessful &&
                    this.parent.controller === event.job.leaderPlayer &&
                    event.job.mark !== this.parent.controller.getOutfitCard() 
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent {2} from going home booted after job', 
                    context.player, this, this.parent),
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutPhaseFinished: () => true
                    },
                    match: this.parent,
                    effect: ability.effects.doesNotReturnAfterJob()
                }));
            }
        });
    }
}

QuarterHorse.code = '20037';

module.exports = QuarterHorse;

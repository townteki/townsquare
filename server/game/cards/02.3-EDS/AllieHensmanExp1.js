const DudeCard = require('../../dudecard.js');

class AllieHensmanExp1 extends DudeCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Allie Hensman (Exp.1)',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Mark an opposing dude',
                cardCondition: {
                    location: 'play area',
                    controller: 'opponent'
                },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} has {1} go after {2}',
                context.player, this, context.target),
            onSuccess: (job, context) => {
                const MarkWorth = job.mark.influence;
                const vBoss = job.mark.controller;
                if(MarkWorth <= 0) {
                    this.game.addMessage('{0} turns out to be a worthless hostage', job.mark);
                } else if (vBoss.getSpendableGhostRock() >= MarkWorth) {
                    this.game.transferGhostRock({
                        from: vBoss,
                        to: context.player,
                        amount: MarkWorth
                    });
                    this.game.addMessage('{0} pays {1} a {2} GR ransom for {3}', vBoss, context.player, MarkWorth, job.mark)
                } else if (this.game.discardFromPlay([job.mark], () => true, { isCardEffect: true }, context)) {
                    this.game.addMessage('{0} was discarded due to {1}\'s job and {2}\'s poverty', job.mark, this, vBoss);
                } else { // should have been discarded, somehow isn't
                    this.game.addMessage('{0} was not discarded despite successful {1} job.', job.mark, this);
                }
            }
        });
    }
}

AllieHensmanExp1.code = '04007';

module.exports = AllieHensmanExp1;

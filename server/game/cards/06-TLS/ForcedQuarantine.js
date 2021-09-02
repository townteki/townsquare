const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class ForcedQuarantine extends ActionCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            location: 'play area',
            ignoreActionCosts: true,
            when: {
                onRoundEnded: () => !!this.parent
            },
            handler: context => {
                const quarantinedDude = this.parent;
                this.game.resolveGameAction(GameActions.discardCard({ card: quarantinedDude }), context).thenExecute(() => {
                    this.game.addMessage('{0} discards {1} because they are in {2}', 
                        context.player, quarantinedDude, this);
                });
            }
        });

        this.job({
            title: 'Noon: Forced Quarantine',
            playType: 'noon',
            cost: ability.costs.bootLeader(),
            target: {
                activePromptTitle: 'Mark opposing dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.influence < card.getPrintedStat('influence') ||
                        card.bullets < card.getPrintedStat('bullets') ||
                        card.value < card.getPrintedStat('value')
                },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                this.game.resolveGameAction(GameActions.bootCard({ card: job.mark }), context);
                context.player.attach(this, job.mark, 'ability', () => {
                    this.game.addMessage('{0} uses {1} to attach it to {2}', context.player, this, job.mark);
                });  
                if(job.leader.location === 'play area') {
                    this.game.addMessage('{0}\'s doctor {1}, gains 1 CP as a result of {2}', context.player, job.leader, this);
                    job.leader.modifyControl(1);
                }    
            }
        });
    }
}

ForcedQuarantine.code = '10039';

module.exports = ForcedQuarantine;

const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class CurseOfFailure extends ActionCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: [
                ability.effects.fullBlank,
                ability.effects.setBullets(0),
                ability.effects.setInfluence(0),
                ability.effects.setControl(0),
                ability.effects.modifyUpkeep(1),
                ability.effects.cannotIncreaseBullets('any', context => context.source !== this),
                ability.effects.cannotDecreaseBullets('any', context => context.source !== this),
                ability.effects.cannotIncreaseInfluence('any', context => context.source !== this),
                ability.effects.cannotDecreaseInfluence('any', context => context.source !== this),
                ability.effects.cannotIncreaseControl('any', context => context.source !== this),
                ability.effects.cannotDecreaseControl('any', context => context.source !== this)
            ]
        });

        this.persistentEffect({
            match: this,
            effect: [
                ability.effects.cannotBeDiscarded('any', context => context.ability && context.ability.isCardAbility())
            ]
        });

        this.job({
            title: 'Curse of Failure',
            playType: 'noon',
            cost: ability.costs.bootLeader(),
            target: {
                activePromptTitle: 'Choose a dude to curse',
                cardCondition: { location: 'play area', controller: 'opponent' },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onCardAbilityResolved: event => event.ability === context.ability
                    },
                    match: this,
                    effect: ability.effects.setActionPlacementLocation(null)
                }));                
                if(job.mark.location === 'play area') {
                    if(job.mark.attachments.length > 0) {
                        context.player.discardCards(job.mark.attachments, false, () => true, {}, context);                 
                    }
                    this.game.resolveGameAction(GameActions.sendHome({ card: job.mark }), context);
                    context.player.attach(this, job.mark, 'ability', () => {
                        this.game.addMessage('{0} uses {1} to attach it to {2}', context.player, this, job.mark);
                    });                 
                }
            }
        });
    }
}

CurseOfFailure.code = '20055';

module.exports = CurseOfFailure;

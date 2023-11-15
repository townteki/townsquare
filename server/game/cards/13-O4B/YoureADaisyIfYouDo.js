const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class YoureADaisyIfYouDo extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'You\'re A Daisy If You Do',
            playType: 'noon',
            cost: ability.costs.boot({
                type: 'dude',
                controller: 'current',
                condition: card => card.isStud() && card.isInTownSquare()
            }),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent' },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: context.target, targetUuid: this.game.townsquare.uuid }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to move {2} to Town Square', context.player, this, context.target);
                });

                if(context.target.control > context.costs.boot.control) {
                    this.game.resolveGameAction(GameActions.bootCard({ card: context.target }).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target);
                    }));
                } else {
                    this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, context.target);
                    }));
                }
                this.game.queueSimpleStep(() => { 
                    if(context.costs.boot.gamelocation === context.target.gamelocation) {
                        this.game.resolveGameAction(GameActions.callOut({ caller: context.costs.boot, callee: context.target }), context);
                    } else {
                        this.game.addMessage('{0} uses {1} but cannot call out {2} with {3} because they are not in the same location', 
                            context.player, this, context.target, context.costs.boot);
                    }
                });                
            }
        });
    }
}

YoureADaisyIfYouDo.code = '21054';

module.exports = YoureADaisyIfYouDo;

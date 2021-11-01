const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FeichiSuitcaseLee extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Feichi "Suitcase" Lee',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target);
                });
                if(this.influence > context.target.influence) {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Choose dude to join',
                        cardCondition: { location: 'play area', controller: 'current', participating: false},
                        cardType: 'dude',
                        gameAction: 'joinPosse',
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.joinPosse({ card }), context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} to join {2} to posse', player, this, card);
                            });
                            return true;
                        },
                        source: this,
                        context
                    });
                } else {
                    this.game.addMessage('{0} uses {1}, but he does not do anything because his influence is lower than {2}', 
                        context.player, this, context.target);
                }
            }
        });
    }
}

FeichiSuitcaseLee.code = '20012';

module.exports = FeichiSuitcaseLee;

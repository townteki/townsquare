const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class Retribution extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Retribution',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            difficulty: context => context.target.value,
            onSuccess: (context) => {
                this.game.addMessage('{0} uses {1} and chooses to ace {2} if {3} reveals cheatin\' hand and {0} reveals a legal hand', 
                    context.player, this, context.target, context.player.getOpponent());
                const eventHandler = () => {
                    if(!context.player.isCheatin() && context.player.getOpponent().isCheatin()) {
                        this.game.resolveGameAction(GameActions.aceCard({ 
                            card: context.target,
                            canPrevent: false 
                        }), context).thenExecute(() => {
                            this.game.addMessage('{0} aces {1} as a result of {2} (cannot be prevented)', context.player, context.target, this);
                        });
                    }
                };
                this.game.once('onDrawHandsRevealed', eventHandler);
                this.game.once('onShootoutPhaseFinished', () => this.game.removeListener('onDrawHandsRevealed', eventHandler));
            },
            source: this
        });
    }
}

Retribution.code = '20045';

module.exports = Retribution;

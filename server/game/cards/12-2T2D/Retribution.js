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
                const eventHandler = () => {
                    if(!context.player.isCheatin() && context.player.getOpponent().isCheatin()) {
                        this.game.resolveGameAction(GameActions.aceCard({ 
                            card: context.target,
                            canPrevent: false 
                        }), context);
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

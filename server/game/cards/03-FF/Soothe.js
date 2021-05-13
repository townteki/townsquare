const SpellCard = require('../../spellcard.js');
const GameActions = require('../../GameActions/index.js');

class Soothe extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Unboot a Dude',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a Dude to unboot',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: { location: 'play area', condition: card => (card.gamelocation === this.gamelocation || 
                    card.isAdjacent(this.gamelocation)) && card.booted},
                cardType: ['dude'],
                gameAction: 'unboot'
            },
            difficulty: 10,
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.bootCard({ card: this.parent }), context).thenExecute(() => {
                    this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to boot {2} and unboot {3}', context.player, this, this.parent, context.target);
                    });
                });
            },
            source: this
        });
    }
}

Soothe.code = '05034';

module.exports = Soothe;

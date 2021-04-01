const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class ParalysisMark extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Paralysis Mark',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a dude to paralyze',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: { condition: card => card.gamelocation === this.gamelocation },
                cardType: ['dude']
            },
            difficulty: context => context.target.value,
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                this.game.addMessage('{0} uses {1} to paralyze {2}', context.player, this, context.target);
            },
            source: this
        });
    }
}

ParalysisMark.code = '02016';

module.exports = ParalysisMark;

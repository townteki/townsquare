const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class FireOfNanahbozho extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Fire of Nanahbozho',
            playType: ['noon', 'shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a dude',
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: ['dude'],
                gameAction: 'unboot'
            },
            difficulty: 10,
            message: context => this.game.addMessage('{0} uses {1} to unboot {2} and make another play', context.player, this, context.target),
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Make another play',
                        buttons: [
                            { text: 'Done', method: 'done' }
                        ],
                        promptTitle: this.title
                    },
                    source: this
                });
            },
            source: this
        });
    }

    done() {
        return true;
    }
}

FireOfNanahbozho.code = '10033';

module.exports = FireOfNanahbozho;

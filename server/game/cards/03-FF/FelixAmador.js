const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class FelixAmador extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Félix Amador',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select miracle to boot',
                cardCondition: { location: 'play area', condition: card => card.parent === this },
                cardType: ['spell'],
                gameAction: 'boot',
                autoSelect: true
            },
            message: context => this.game.addMessage('{0} uses {1} and boots {2} to look at the top card of their deck', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() =>
                    this.game.resolveGameAction(
                        GameActions.lookAtDeck(context => ({
                            player: context.player,
                            lookingAt: context.player
                        })),
                        context
                    ));
            }
        });
    }
}

FelixAmador.code = '05018';

module.exports = FelixAmador;

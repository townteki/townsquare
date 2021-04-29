const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class LarrySevensSwift extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            when: {
                onPossesFormed: event => event.shootout.getPosseByPlayer(this.controller).isInPosse(this) &&
                    (!this.booted || this.controller.firstPlayer)
            },
            target: {
                activePromptTitle: 'Larry "Sevens" Swift',
                cardCondition: { location: 'play area', controller: 'current', condition: card => card.parent === this },
                cardType: ['spell'],
                gameAction: 'boot',
                autoSelect: true
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select an attachment',
                        waitingPromptTitle: 'Waiting for opponent to select an attachment',
                        cardCondition: card => card.location === 'play area' && 
                            card.controller !== this.controller &&
                            card.isParticipating(),
                        cardType: ['spell', 'goods', 'action'],
                        gameAction: 'boot',
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.bootCard({ card }), context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} and boots {2} to boot {3}', 
                                    player, this, context.target, card);
                            });
                            return true;
                        }
                    });
                });
            }
        });
    }
}

LarrySevensSwift.code = '20029';

module.exports = LarrySevensSwift;

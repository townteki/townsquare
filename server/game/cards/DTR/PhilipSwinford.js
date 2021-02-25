const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class PhilipSwinford extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => !this.controller.isCheatin() && this.controller.getOpponent().isCheatin()
            },
            handler: context => {
                this.game.promptForYesNo(this.controller, {
                    title: 'Do you want to discard a card to draw a card?',
                    onYes: () => {
                        this.game.promptForSelect(this.controller, {
                            promptTitle: this.title,
                            activePromptTitle: 'Select a card to discard',
                            waitingPromptTitle: 'Waiting for opponent to discard a card',
                            cardCondition: card => card.location === 'hand' && card.controller === this.controller,
                            onSelect: (p, card) => {
                                this.game.resolveGameAction(GameActions.discardCard({ card: card }, context)).thenExecute(() => {
                                    this.game.resolveGameAction(GameActions.drawCards({ player: p, amount: 1 }), context).thenExecute(() => {
                                        this.game.addMessage('{0} discards {1} to draw a card thanks to the {2}.', p, card, this);
                                    });
                                });
                                return true;
                            }
                        });            
                    },
                    source: this
                });
            }
        });
    }
}

PhilipSwinford.code = '01017';

module.exports = PhilipSwinford;

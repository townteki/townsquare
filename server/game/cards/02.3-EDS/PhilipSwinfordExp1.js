const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class PhilipSwinfordExp1 extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => !this.controller.isCheatin() && this.controller.getOpponent().isCheatin()
            },
            handler: context => {
                this.game.promptForYesNo(this.controller, {
                    title: 'Do you want to draw a card to discard a card?',
                    onYes: (player) => {
                        this.game.resolveGameAction(GameActions.drawCards({ player: player, amount: 1 }), context).thenExecute(() => {
                            this.game.promptForSelect(this.controller, {
                                promptTitle: this.title,
                                activePromptTitle: 'Select a card to discard',
                                waitingPromptTitle: 'Waiting for opponent to discard a card',
                                cardCondition: card => card.location === 'hand' && card.controller === this.controller,
                                onSelect: (p, card) => {
                                    this.game.resolveGameAction(GameActions.discardCard({ card: card }), context).thenExecute(() => {
                                        this.game.addMessage('{0} draws a card and then discards {1} thanks to the {2}.', p, card, this);
                                    });
                                    return true;
                                }
                            }); 
                        });           
                    },
                    source: this
                });
            }
        });
    }
}

PhilipSwinfordExp1.code = '04003';

module.exports = PhilipSwinfordExp1;

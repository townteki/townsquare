const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class PadreErnestodeDiaz extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => this.controller.getOpponent().isCheatin()
            },
            handler: context => {
                context.game.promptForYesNo(context.player, {
                    title: 'Do you want to use Padre Ernesto de Diaz\'s ability?',
                    onYes: () => {
                        this.game.promptForSelect(this.controller, {
                            promptTitle: this.title,
                            activePromptTitle: 'Select a miracle to boot',
                            waitingPromptTitle: 'Waiting for opponent to select a card',
                            cardCondition: card => card.parent === this && card.getType() === 'spell' && card.isMiracle(),
                            onSelect: (p, card) => {
                                this.game.resolveGameAction(GameActions.bootCard({ card: card }, context)).thenExecute(() => {
                                    this.game.resolveGameAction(GameActions.drawCards({ player: p, amount: 1 }), context).thenExecute(() => {
                                        this.game.addMessage('{0} uses {1} to boot {2} and draw a card', p, this, card);
                                    });
                                });
                                return true;
                            }
                        });            
                    }
                });
            }
        });
    }
}

PadreErnestodeDiaz.code = '20018';

module.exports = PadreErnestodeDiaz;

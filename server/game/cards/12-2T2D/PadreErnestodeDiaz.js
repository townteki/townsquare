const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class PadreErnestodeDiaz extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => this.controller.getOpponent().isCheatin() &&
                    this.hasAttachment(att => att.hasKeyword('Miracle') && !att.booted)
            },
            handler: context => {
                context.game.promptForYesNo(context.player, {
                    title: 'Do you want to boot a Miracle?',
                    onYes: () => {
                        context.ability.selectAnotherTarget(context.player, context, {
                            promptTitle: this.title,
                            activePromptTitle: 'Select a miracle to boot',
                            waitingPromptTitle: 'Waiting for opponent to select a card',
                            cardCondition: card => card.parent === this && card.getType() === 'spell' && card.isMiracle(),
                            gameAction: 'boot',
                            onSelect: (p, card) => {
                                this.game.resolveGameAction(GameActions.bootCard({ card: card }, context)).thenExecute(() => {
                                    this.game.resolveGameAction(GameActions.drawCards({ player: p, amount: 1 }), context).thenExecute(() => {
                                        this.game.addMessage('{0} uses {1} to boot {2} and draw a card', p, this, card);
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

PadreErnestodeDiaz.code = '20018';

module.exports = PadreErnestodeDiaz;

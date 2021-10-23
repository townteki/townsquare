const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class GeneseeGinaTailfeathers extends DudeCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Genesse Tailfeathers',
            grifter: true,
            cost: [ability.costs.bootSelf()],
            handler: context => {
                this.game.promptForSelect(this.controller, {
                    promptTitle: this.title,
                    activePromptTitle: 'Select a card to discard',
                    waitingPromptTitle: 'Waiting for opponent to discard a card',
                    cardCondition: card => card.location === 'hand' && card.controller === this.controller,
                    onSelect: (p, card) => {
                        this.game.resolveGameAction(GameActions.discardCard({ card: card }, context)).thenExecute(() => {
                            this.game.resolveGameAction(GameActions.drawCards({ player: p, amount: 2 }), context).thenExecute(() => {
                                this.game.addMessage('{0} discards {1} to draw two cards thanks to {2}', p, card, this);
                            });
                        });
                    }
                });
            }
        });
    }
}

GeneseeGinaTailfeathers.code = '03009';

module.exports = GeneseeGinaTailfeathers;

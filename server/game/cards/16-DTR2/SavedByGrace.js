const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class SavedByGrace extends OutfitCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            effect: ability.effects.reduceFirstCardCostEachRound(1, card => card.getType() === 'spell' && card.isMiracle())
        });

        this.reaction({
            title: 'Saved by Grace',
            when: {
                onPullSuccess: event => 
                    event.pullingDude && 
                    event.pullingDude.controller === this.controller && 
                    event.source.getType() === 'spell' &&
                    event.source.isMiracle()
            },
            cost: ability.costs.bootSelf(),
            handler: context => {
                context.player.moveCard(context.event.pulledCard, 'hand');
                this.game.promptForSelect(this.controller, {
                    activePromptTitle: 'Select a card to discard',
                    waitingPromptTitle: 'Waiting for opponent to discard a card',
                    cardCondition: card => card.location === 'hand' && card.controller === this.controller,
                    onSelect: (p, card) => {
                        this.game.resolveGameAction(GameActions.discardCard({ card: card }, context)).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to put pulled {2} to their hand and discards {3}', 
                                p, this, context.event.source, card);
                        });
                        return true;
                    },
                    source: this
                }); 
            }
        });
    }
}

SavedByGrace.code = '25093';

module.exports = SavedByGrace;

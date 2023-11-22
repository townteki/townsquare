const OutfitCard = require('../../outfitcard.js');

class PropertyIsTheft extends OutfitCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout && this.controller.getOpponent().isCheatin()
            },
            handler: context => {
                const opponent = this.controller.getOpponent();
                if(opponent.getSpendableGhostRock() >= 1) {
                    if(context.player.isCheatin()) {
                        opponent.spendGhostRock(1);
                        this.game.addMessage('{0} pays 1 GR to bank due to {1}', opponent, this);
                    } else {
                        this.game.transferGhostRock({
                            from: opponent,
                            to: context.player,
                            amount: 1
                        });
                        this.game.addMessage('{0} pays 1 GR to {1} due to {2}', opponent, context.player, this);
                    }
                }
            }
        });

        this.reaction({
            title: 'React: Property Is Theft',
            when: {
                onGhostRockTransferred: event => event.source === this.owner && 
                    event.target === this.owner.getOpponent() &&
                    event.amount > 0
            },
            cost: ability.costs.bootSelf(),
            handler: context => {
                const amountOfCards = this.game.shootout ? 2 : 1;
                context.player.drawCardsToHand(amountOfCards, context);
                context.player.discardFromHand(amountOfCards, discardedCards => 
                    this.game.addMessage('{0} uses {1} to draw {2} cards and discard {3}', context.player, this, amountOfCards, discardedCards), 
                {
                    title: this.title,
                    activePromptTitle: `Discard up to ${amountOfCards} card(s)`
                }, context);
            }
        });
    }
}

PropertyIsTheft.code = '20002';

module.exports = PropertyIsTheft;

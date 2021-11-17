const ActionCard = require('../../actioncard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BuriedTreasure extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Buried Treasure',
            playType: ['noon'],
            cost: ability.costs.ace(card => card.location === 'discard pile' && 
                card.controller === this.controller),
            message: context => 
                this.game.addMessage('{0} uses {1} and aces {2} to gain 3 GR and draw a card', 
                    context.player, this, context.costs.ace),
            handler: context => {
                context.player.modifyGhostRock(3);
                context.player.drawCardsToHand(1, context);
            }
        });
    }
}

BuriedTreasure.code = '08020';

module.exports = BuriedTreasure;

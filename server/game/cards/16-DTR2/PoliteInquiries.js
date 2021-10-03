const ActionCard = require('../../actioncard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class PoliteInquiries extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Polite Inquiries',
            playType: ['noon'],
            cost: ability.costs.boot(card =>
                card.location === 'play area' &&
                card.controller === this.owner &&
                card.getType() === 'dude' &&
                !card.isAtHome()),
            handler: context => {
                if(!context.costs.boot.bullets) {
                    return;
                }
                const numOfCards = context.costs.boot.bullets > 4 ? 4 : context.costs.boot.bullets;
                context.player.drawCardsToHand(numOfCards, context);
                context.player.discardFromHand(numOfCards, discardedCards => {
                    context.player.drawCardsToHand(1, context);
                    this.game.addMessage('{0} uses {1} to draw {2} cards, then discard {3} and to draw another card', 
                        context.player, this, numOfCards, discardedCards);
                }, {
                    title: this.title
                }, context);
            }
        });
    }
}

PoliteInquiries.code = '25104';

module.exports = PoliteInquiries;

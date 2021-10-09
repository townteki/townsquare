const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TaffsDistillery extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Taff\'s Distillery',
            when: {
                onJobSuccessful: event => event.context.player === this.controller && 
                    !['outfit', 'legend'].includes(event.context.source.getType()) &&
                    event.job.mark !== this.controller.getOutfitCard()

            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to draw a card', context.player, this),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
    }
}

TaffsDistillery.code = '19020';

module.exports = TaffsDistillery;

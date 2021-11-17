const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class SiftingSquirrel extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Sifting Squirrel',
            grifter: true,
            cost: ability.costs.bootSelf(),
            handler: context => {
                context.player.drawCardsToHand(1, context).thenExecute(() => {
                    context.player.discardFromHand(1, discarded => {
                        if(discarded.some(card => card.hasOneOfKeywords(['spirit', 'technique']))) {
                            context.player.drawCardsToHand(1, context);
                            this.game.addMessage('{0} uses {1} to draw card, discard {2} and to draw another card', 
                                context.player, this, discarded);
                        } else {
                            this.game.addMessage('{0} uses {1} to draw card and discard {2}', context.player, this, discarded);
                        }
                    }, {}, context);
                });
            }
        });
    }
}

SiftingSquirrel.code = '23013';

module.exports = SiftingSquirrel;

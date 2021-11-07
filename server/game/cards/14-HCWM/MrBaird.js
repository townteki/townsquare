const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MrBaird extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Mr. Baird',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(1),
                ability.costs.discardFromHand(card => card.getType() === 'deed')
            ],
            target: {
                activePromptTitle: 'Choose a deed to put to hand',
                cardCondition: { 
                    location: 'discard pile', 
                    controller: 'current', 
                    condition: card => !card.isOutOfTown() 
                },
                cardType: ['deed']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and discards {2} to put {3} into their hand', 
                    context.player, this, context.costs.discardFromHand, context.target),
            handler: context => {
                context.player.moveCardWithContext(context.target, 'hand', context, true);
            }
        });
    }
}

MrBaird.code = '22008';

module.exports = MrBaird;

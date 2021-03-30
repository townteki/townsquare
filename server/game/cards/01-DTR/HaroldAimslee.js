const DudeCard = require('../../dudecard.js');

class HaroldAimslee extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Harold Aimslee',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardFromHand()
            ],
            target: {
                activePromptTitle: 'Select non-Weapon Gadget',
                cardCondition: { location: 'discard pile', condition: card => card.hasKeyword('Gadget') && !card.hasKeyword('Weapon') },
                cardType: ['goods']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to discard {2} and get {3} to hand from discard pile', 
                    context.player, this, context.costs.discardFromHand, context.target),
            handler: context => {
                context.player.moveCard(context.target, 'hand');
            }
        });
    }
}

HaroldAimslee.code = '01032';

module.exports = HaroldAimslee;

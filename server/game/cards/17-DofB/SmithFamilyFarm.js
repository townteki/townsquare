const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class SmithFamilyFarm extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            // Add always-on condition if effect is state dependent so it will be 
            // rechecked after every event
            condition: () => this.game.findCardsInLocation(this.uuid, card => card.getType() === 'dude' && !card.booted).length,
            match: this,
            effect: [
                ability.effects.modifyControl(1)
            ]
        });

        this.action({
            title: 'Get 2 GR and a card',
            playType: ['noon'],
            cost: ability.costs.boot(card =>
                card.getType() === 'dude' &&
                card.controller.equals(this.controller) &&
                this.equals(card.locationCard)
            ),
            message: context => 
                this.game.addMessage('{0} uses {1} and boots {2} to get 2 GR and to draw a card', context.player, this),
            handler: context => {
                context.player.modifyGhostRock(2);
                context.player.drawCardsToHand(1, context);
            }
        });
    }
}

SmithFamilyFarm.code = '25030';

module.exports = SmithFamilyFarm;

const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FarnumsConsortium extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: card => card.location === 'play area' &&
                card.getType() === 'deed' &&
                card.owner.equals(this.owner) &&
                !card.isOutOfTown() &&
                this.game.getDudesAtLocation(card.uuid).some(dude => dude.controller.equals(this.owner)),
            effect: ability.effects.modifyProduction(1)
        });

        this.action({
            title: 'Noon: Farnum\'s Consortium',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            ifCondition: () => {
                if(this.game.getNumberOfPlayers() === 1) {
                    return true;
                }
                return this.owner.hand.length < this.owner.getOpponent().hand.length;
            },
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but it fails because they do not have fewer cards than {2}', 
                    context.player, this, context.player.getOpponent()),
            handler: context => {
                if(context.player.getSpendableGhostRock() >= 2) {
                    context.player.spendGhostRock(2);
                    context.player.drawCardsToHand(1, context);
                    this.game.addMessage('{0} uses {1} and pays 2 GR to draw a card', context.player, this);
                } else {
                    this.game.addMessage('{0} uses {1} but does not have 2 GR to pay', context.player, this);
                }
            }
        });
    }
}

FarnumsConsortium.code = '24003';

module.exports = FarnumsConsortium;

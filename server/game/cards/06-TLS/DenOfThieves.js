const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DenOfThieves extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.owner.availableGrifterActions = 2;
        this.persistentEffect({
            targetController: 'current',
            effect: ability.effects.reduceCost({
                playingTypes: ['play', 'shoppin', 'setup'],
                amount: 1,
                match: card => card.hasKeyword('grifter')
            })
        });

        this.reaction({
            title: 'React: Den of Thieves',
            when: {
                onDrawHandsRevealed: () => true
            },
            cost: [
                ability.costs.bootSelf(),
                ability.costs.raiseBounty(card => card.location === 'play area' &&
                    card.controller === this.owner &&
                    card.hasKeyword('grifter'))
            ],
            message: context => 
                this.game.addMessage('{0} uses {1} and adds bounty to {2} to increase their rank by 1 and gain 1 GR ; ' +
                    '{0}\'s hand is now considered illegal', context.player, this, context.costs.raiseBounty),
            handler: context => {
                context.player.modifyRank(1, context);
                context.player.getHandRank().cheatin = true;
                context.player.modifyGhostRock(1);
            }
        });
    }
}

DenOfThieves.code = '10003';

module.exports = DenOfThieves;

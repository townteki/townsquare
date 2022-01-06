const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class DeadwoodMinersAlliance extends OutfitCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: card => card.getType() === 'dude' &&
                card.isInTownSquare() &&
                card.bounty >= 4,
            effect: ability.effects.modifyControl(1)
        });

        this.action({
            title: 'Noon: Deadwood Miner\'s Alliance',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card => card.location === 'play area' &&
                    card.controller === this.controller &&
                    card.getType() === 'dude' &&
                    card.locationCard && card.locationCard.owner !== this.owner)
            ],
            handler: context => {
                let bountyAmount = 1;
                let amountGR = 1;
                this.game.resolveGameAction(GameActions.addBounty({ card: context.costs.boot }), context);
                context.player.modifyGhostRock(1);
                const targetLocation = context.costs.boot.locationCard;
                if(targetLocation && targetLocation.hasKeyword('public')) {
                    this.game.resolveGameAction(GameActions.addBounty({ card: context.costs.boot }), context);
                    bountyAmount += 1;
                }
                if(targetLocation && targetLocation.hasKeyword('private')) {
                    context.player.modifyGhostRock(1);
                    amountGR += 1;
                }
                this.game.addMessage('{0} uses {1} to boot {2} and give them {3} bounty and to gain {4} GR', 
                    context.player, this, context.costs.boot, bountyAmount, amountGR);     
            }
        });
    }
}

DeadwoodMinersAlliance.code = '24011';

module.exports = DeadwoodMinersAlliance;

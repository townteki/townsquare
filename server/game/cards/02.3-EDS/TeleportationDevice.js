const GoodsCard = require('../../goodscard.js');
const GameActions = require('../../GameActions/index.js');

class TeleportationDevice extends GoodsCard {
    setupCardAbilities(ability) {
        this.attachmentRestriction(card => 
            card.controller === this.controller &&
            card.getType() === 'deed'
        );

        this.action({
            title: 'Noon: Teleportation Device',
            playType: ['noon'],
            repeatable: true,
            cost: [
                ability.costs.payGhostRock(1),
                ability.costs.pull();
            ],
            targets: {
                tDude: {
                    activePromptTitle: 'Select your dude to teleport',
                    cardCondition: {
                        location: 'play area',
                        controller: 'current',
                        condition: card => card.locationCard === this.locationCard
                    },
                    cardType: ['dude']
                },
                tDest: {
                    activePromptTitle: 'Choose teleportation destination',
                    cardCondition: {
                        location: 'play area',
                        condition: card => card.gamelocation !== this.gamelocation
                    },
                    cardType: ['location', 'townsquare']
                }
            },
            handler: context => {
                let teleMessage = '{0} uses {1} on {2}';
                if(context.pull.pulledSuit.toLowerCase() === 'clubs') {
                    this.game.resolveGameAction(GameActions.discardCard({ card: context.targets.tDude }), context).thenExecute(() => {
                        teleMessage+= ', no one knows where they ended up';
                    });
                } else {
                    this.game.resolveGameAction(GameActions.moveDude({ 
                        card: context.targets.tDude, 
                        targetUuid: context.targets.tDest.uuid 
                    }), context).thenExecute(() => {
                        teleMessage+= ', moving them to {3}';
                    });
                }
                this.game.addMessage(teleMessage, context.player, this, context.targets.tDude, context.targets.tDest);
            }
        });
    }
}

TeleportationDevice.code = '04015';

module.exports = TeleportationDevice;

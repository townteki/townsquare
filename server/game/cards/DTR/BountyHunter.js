const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class BountyHunter extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Bounty Hunter',
            playType: ['noon'],
            cost: ability.costs.payReduceableGRCost(2),
            target: {
                activePromptTitle: 'Select wanted dude to hunt',
                cardCondition: { location: 'play area', controller: 'opponent', wanted: true },
                cardType: ['dude']
            },
            handler: context => {
                let gunslinger = context.player.placeToken('Gunslinger', context.target.gamelocation);
                this.game.resolveGameAction(GameActions.callOut({ 
                    caller: gunslinger,
                    callee: context.target,
                    isCardEffect: true,
                    canReject: false
                }));
                this.game.addMessage('{0} pays for a {1} to hunt {2}.', context.player, this, context.target);
            }
        });
    }
}

BountyHunter.code = '01126';

module.exports = BountyHunter;
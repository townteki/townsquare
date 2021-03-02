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
                if(context.target.canBeCalledOut()) {
                    this.game.resolveGameAction(GameActions.callOut({ 
                        caller: gunslinger,
                        callee: context.target,
                        isCardEffect: true,
                        canReject: false
                    }), context);
                    this.game.addMessage('{0} pays for a {1} to hunt {2}.', context.player, this, context.target);
                } else {
                    gunslinger.removeFromGame();
                    this.game.addMessage('{0} pays for a {1} to hunt {2}, but they cannot be called out.', context.player, this, context.target);
                }
            }
        });
    }
}

BountyHunter.code = '01126';

module.exports = BountyHunter;

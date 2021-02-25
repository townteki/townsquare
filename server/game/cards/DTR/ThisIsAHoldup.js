const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class ThisIsAHoldup extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'This is a Holdup!',
            playType: ['noon'],
            cost: ability.costs.boot(card =>
                card.getType() === 'dude' &&
                card.locationCard.owner !== card.controller 
            ),
            handler: context => {
                let robbedLocation = context.costs.boot.locationCard;
                let robbedPlayer = context.player.getOpponent();
                let robbedAmount = robbedLocation.production;
                if(robbedAmount > robbedPlayer.ghostrock) {
                    robbedAmount = robbedPlayer.ghostrock;
                }
                context.player.modifyGhostRock(robbedAmount);
                robbedPlayer.modifyGhostRock(-robbedAmount);
                this.game.resolveGameAction(GameActions.addBounty({ card: context.costs.boot, amount: robbedAmount }), context);
                this.game.addMessage('{0} uses {1} to take {2} GR from {3}.', context.player, this, robbedAmount, robbedPlayer);
            }
        });
    }
}

ThisIsAHoldup.code = '01137';

module.exports = ThisIsAHoldup;

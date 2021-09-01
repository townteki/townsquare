const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class TheRDRanch extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'The R&D Ranch',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            message: context => this.game.addMessage('{0} uses {1} to gain 2 GR', context.player, this),
            handler: context => {
                context.player.modifyGhostRock(2);
                context.player.pull((pulledCard, pulledValue, pulledSuit) => {
                    if(pulledSuit === 'Clubs') {
                        const dudesHere = this.game.getDudesAtLocation(this.gamelocation);
                        if(dudesHere.length) {
                            context.player.discardCards(dudesHere, false);
                        }
                        this.game.resolveGameAction(GameActions.discardCard({ card: this }), context);
                        this.game.addMessage('{0} uses {1}, but the experiment fails and {1} is discarded with all cards there ', context.player, this);
                    }
                });
            }
        });
    }
}

TheRDRanch.code = '02012';

module.exports = TheRDRanch;

const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class NathanShane extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Nathan Shane',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            handler: context => {
                this.game.resolveGameAction(GameActions.lookAtHand({ 
                    player: context.player, 
                    opponent: context.player.getOpponent(),
                    title: `Look at ${context.player.getOpponent().name}'s hand to discard an action card`,
                    numToShow: this.bullets,
                    condition: card => card.getType() === 'action',
                    onSelect: (player, cards) => player.discardCards(cards, () => 
                        context.game.addMessage('{0} uses {1} to look at opponent\' hand and discard {2}', player, this, cards), {}, context),
                    onCancel: player => 
                        context.game.addMessage('{0} uses {1} to look at opponent\' hand but did not find any action card to discard', player, this),
                    context
                }), context);
            }
        });
    }
}

NathanShane.code = '08004';

module.exports = NathanShane;

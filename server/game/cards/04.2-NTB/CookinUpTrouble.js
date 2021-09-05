const ActionCard = require('../../actioncard.js');
const GenericTracker = require('../../EventTrackers/GenericTracker.js');
const GameActions = require('../../GameActions/index.js');

class CookinUpTrouble extends ActionCard {
    setupCardAbilities() {
        this.tracker = GenericTracker.forRound(this.game, 'onDrawHandsRevealed', () => 
            this.owner.getOpponent().isCheatin());
        this.action({
            title: 'Noon: Cookin\' Up Trouble',
            playType: ['noon'],
            condition: () => this.game.getNumberOfPlayers() > 1,
            message: context => this.game.addMessage('{0} uses {1} to ', context.player, this),
            handler: context => {
                let lookAtHandTitle = `Look at ${context.player.getOpponent().name}'s hand to discard a card`;
                if(!this.tracker.eventHappened()) {
                    lookAtHandTitle = `Look at ${context.player.getOpponent().name}'s hand`;
                }
                this.game.resolveGameAction(GameActions.lookAtHand({ 
                    player: context.player, 
                    opponent: context.player.getOpponent(),
                    title: lookAtHandTitle,
                    numToShow: context.player.getOpponent().hand.length,
                    condition: card => this.tracker.eventHappened() && ['action', 'goods', 'spell'].includes(card.getType()),
                    onSelect: (player, cards) => player.discardCards(cards, false, () => 
                        context.game.addMessage('{0} uses {1} to look at opponent\' hand and discard {2}', player, this, cards), {}, context),
                    onCancel: player => {
                        if(this.tracker.eventHappened()) {
                            context.game.addMessage('{0} uses {1} to look at opponent\' hand but did not find any action card to discard', 
                                player, this);
                        } else {
                            context.game.addMessage('{0} uses {1} to look at opponent\' hand', player, this);
                        }
                    },
                    context
                }), context);                
            }
        });
    }
}

CookinUpTrouble.code = '07019';

module.exports = CookinUpTrouble;

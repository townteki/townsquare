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
                    condition: card => this.tracker.eventHappened() && this.checkIfValidForTrouble(card),
                    onSelect: (player, cards) => player.discardCards(cards, false, () => 
                        context.game.addMessage('{0} uses {1} to look at opponent\' hand and discard {2}', player, this, cards), {}, context),
                    onCancel: player => {
                        if(this.tracker.eventHappened()) {
                            context.game.addMessage('{0} uses {1} to look at opponent\' hand but did not find any card to discard', 
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
    checkIfValidForTrouble(checkedCard) {
        if(!(['action', 'goods', 'spell'].includes(checkedCard.getType()))) {
            return false;
        }
        return !checkedCard.abilities.actions.some(action => {
            if(action.playType && (action.playType.includes('cheatin resolution'))) {
                return true;
            }
            return false;
        });
    }
}

CookinUpTrouble.code = '07019';

module.exports = CookinUpTrouble;

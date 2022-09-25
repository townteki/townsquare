const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ArthurDingler extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Arthur Dingler',
            grifter: true,
            cost: ability.costs.bootSelf(),
            handler: context => {
                this.game.resolveGameAction(GameActions.lookAtDeck({
                    player: context.player,
                    lookingAt: context.player,
                    context,
                    amount: 5,
                    additionalButtons: [
                        { text: 'Discard Them', arg: 'discard'},
                        { text: 'Shuffle Into Deck', arg: 'shuffle'},
                        { text: 'Return In Same Order', arg: 'return'}
                    ],
                    onMenuCommand: (player, arg) => {
                        const actualAmount = Math.min(5, player.drawDeck.length);
                        let topCards = player.drawDeck.slice(0, actualAmount);
                        if(arg === 'discard') {
                            player.discardCards(topCards, discarded => 
                                this.game.addMessage('{0} uses {1} to discard {2} from top of their deck', player, this, discarded), 
                            {}, context);
                            return true;
                        }
                        if(arg === 'shuffle') {
                            player.shuffleDrawDeck(); 
                            this.game.addMessage('{0} uses {1} to look at top 5 cards of their deck and shuffle them back', 
                                player, this);
                            return true;
                        }
                        this.game.addMessage('{0} uses {1} to look at top 5 cards of their deck and return them in the same order', 
                            player, this);
                        return true;
                    }
                }));
                this.game.once('onPlayersAntedForLowball', event => {
                    event.gamblingPhase.lowballPot++;
                    this.game.addMessage('{0} adds another GR to the lowball pot thanks to {1}', 
                        context.player, this);
                });
            }
        });
    }
}

ArthurDingler.code = '23005';

module.exports = ArthurDingler;

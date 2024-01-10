const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class DeniseBrancini extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.location === 'play area',
            match: this,
            effect: [
                ability.effects.dynamicUpkeep(() => this.getNumOfAcedJokers()),
                ability.effects.dynamicBullets(() => this.getNumOfAcedJokers())
            ]
        });
        this.traitReaction({
            when: {
                onCardDiscarded: event => event.card === this && event.isUpkeep
            },
            handler: context => {
                const myFoe = context.player.getOpponent();
                const deadJokes = myFoe.deadPile.filter(card => card.getType() === 'joker');
                if(deadJokes.length) {
                    context.game.promptForYesNo(myFoe, {
                        title: 'Do you want to shuffle all jokers from your boot hill into your deck?',
                        onYes: () => this.game.resolveGameAction(GameActions.shuffleIntoDeck({ cards: deadJokes }), context).thenExecute(() => {
                            this.game.addMessage('{0} shuffles their dead jokers into their deck due to {1}', myFoe, this);
                        }),
                        onNo: () => this.game.addMessage('{0} declines to recycle their dead jokers', myFoe),
                        source: this
                    });
                }
            }
        });
    }
    getNumOfAcedJokers() {
        return this.game.allCards.reduce((num, card) => {
            if(card.getType() === 'joker' && card.location === 'dead pile') {
                return num + 1;
            }
            return num;
        }, 0);
    }
}

DeniseBrancini.code = '16009';

module.exports = DeniseBrancini;

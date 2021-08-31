const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class ShermanMortgage extends DeedCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onShootoutPhaseStarted: () => true
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: this }), context);
            }
        });

        this.persistentEffect({
            targetController: 'opponent',
            condition: () => !this.booted,
            effect: [
                ability.effects.increaseCost({
                    playingTypes: 'shoppin',
                    amount: () => this.getIncreaseCostAmount(),
                    match: card => card.getType() === 'deed'               
                })
            ]
        });
    }

    getIncreaseCostAmount() {
        if(this.game.getOpponents(this.controller).length === 0) {
            return 0;
        }
        const numOfDeeds = this.controller.getOpponent().cardsInPlay.filter(card => card.getType() === 'deed').length;
        return Math.floor(numOfDeeds / 4);
    }
}

ShermanMortgage.code = '18023';

module.exports = ShermanMortgage;

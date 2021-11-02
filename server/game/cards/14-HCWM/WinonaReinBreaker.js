const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class WinonaReinBreaker extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Winona Rein-Breaker',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(1)
            ],
            target: {
                activePromptTitle: 'Choose Sidekick to discard',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true,
                    keyword: 'sidekick'
                },
                gameAction: 'discard'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to discard {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context);
            }
        });
    }
}

WinonaReinBreaker.code = '22030';

module.exports = WinonaReinBreaker;

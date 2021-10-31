const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class KivaOfFathomlessReach extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Kiva of Fathomless Reach',
            when: {
                onSundownAfterVictoryCheck: () => true
            },
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose your dude to move',
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to move {2} to Town Square', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    
                    card: context.target, targetUuid: this.game.townsquare.uuid 
                }), context);
            }
        });
    }
}

KivaOfFathomlessReach.code = '22033';

module.exports = KivaOfFathomlessReach;

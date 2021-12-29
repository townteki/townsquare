const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DeborahWestExp1 extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Deborah West (Exp.1)',
            playType: ['shootout'],
            cost: ability.costs.boot(card =>
                card.location === 'play area' &&
                card.parent === this &&
                (card.hasKeyword('miracle') || (card.hasAllOfKeywords(['weapon', 'melee'])))
            ),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and boots {2} to add one bounty to {3}', 
                    context.player, this, context.costs.boot, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.addBounty({ card: context.target }), context);
            }
        });
    }
}

DeborahWestExp1.code = '24075';

module.exports = DeborahWestExp1;

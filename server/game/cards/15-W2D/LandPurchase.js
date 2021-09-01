const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class LandPurchase extends DeedCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Land Purchase',
            playType: 'noon',
            cost: ability.costs.bootLeader(),
            target: {
                cardCondition: { condition: card => card === this },
                autoSelect: true
            },
            message: context => this.game.addMessage('{0} plays {1} marking itself', context.player, this),
            onSuccess: (job, context) => {
                this.game.resolveGameAction(GameActions.discardCard({ card: this }), context);
                this.game.resolveGameAction(
                    GameActions.search(
                        {
                            title: 'Select a deed to put into play',
                            location: 'discard pile',
                            match: { condition: card => card.getType() === 'deed' && card !== this },
                            player: context.player,
                            numToSelect: 1,
                            message: {
                                format: '{player} searches their discard pile to put {searchTarget} into play'
                            },
                            cancelMessage: {
                                format: '{player} searches their discard pile and finds nothing'
                            },
                            handler: card => {
                                this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(3), context.player, card);
                            }
                        }), context
                );  
            }
        });
    }
}

LandPurchase.code = '23030';

module.exports = LandPurchase;

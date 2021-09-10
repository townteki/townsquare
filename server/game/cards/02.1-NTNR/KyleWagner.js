const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

/** @typedef {import('../../AbilityDsl')} AbilityDsl */
class KyleWagner extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Kyle Wagner',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            ifCondition: () => this.locationCard && this.locationCard.hasKeyword('ranch'),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but he fails as he is not at a Ranch', context.player, this),
            message: context => 
                this.game.addMessage('{0} uses {1} to unboot {2} and its abilities may be used an additional time', 
                    context.player, this, this.locationCard),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: this.locationCard }), context);
                this.locationCard.resetAbilities();
            }
        });
    }
}

KyleWagner.code = '02005';

module.exports = KyleWagner;

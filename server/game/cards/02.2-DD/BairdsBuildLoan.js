const DeedCard = require('../../deedcard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class BairdsBuildLoan extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Play a Deed',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),

            target:{
                activePromptTitle: 'Select a deed',
                cardCondition: { location: 'hand', controller: 'current' },
                cardType: ['deed']
            },
            message: context => {
                this.game.addMessage('{0} uses {1} to build {2}, reducing it\'s cost by 2', context.player, this, context.target);
            },
            handler: context => {
                this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(2), context.player, context.target);
            }
        });
    }
}

BairdsBuildLoan.code = '03013';

module.exports = BairdsBuildLoan;

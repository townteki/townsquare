const DeedCard = require('../../deedcard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class GeneralStore extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'General Store',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target:{
                activePromptTitle: 'Select a goods or spell to attach',
                cardCondition: { location: 'hand' },
                cardType: ['goods', 'spell']
            },
            message: context => {
                this.game.addMessage('{0} uses {1} to shop for {2}, reducing it\'s cost by 2', context.player, this, context.target);
            },
            handler: context => {
                this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(2), context.player, context.target);
            }
        });
    }
}

GeneralStore.code = '01077';

module.exports = GeneralStore;

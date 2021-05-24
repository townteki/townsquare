const DeedCard = require('../../deedcard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class LongStridesRanch extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.controller.cardsInPlay.reduce((count, card) => {
                if(card.hasKeyword('horse')) {
                    return count + 1;
                }
                return count;
            }, 0) >= 2,
            match: this,
            effect: ability.effects.modifyProduction(2)
        });
        this.action({
            title: 'Long Strides Ranch',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a Horse',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'hand', 
                    controller: 'current', 
                    condition: card => card.hasKeyword('horse') 
                },
                cardType: ['goods', 'spell']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to attach {2} from their hand reducing it\'s cost by 2 GR', 
                    context.player, this, context.target),
            handler: context => {
                this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(2), context.player, context.target);
            }
        });
    }
}

LongStridesRanch.code = '16010';

module.exports = LongStridesRanch;

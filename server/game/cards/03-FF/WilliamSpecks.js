const DudeCard = require('../../dudecard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class WilliamSpecks extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: William Specks',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select Deed or Gadget',
                cardCondition: { 
                    location: 'hand', 
                    controller: 'current', 
                    condition: card => card.isGadget() ||
                        card.isOutOfTown() || card.hasKeyword('ranch')
                },
                cardType: ['deed', 'goods', 'dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to put {2} into play', context.player, this, context.target),
            handler: context => {
                this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(
                    this.getSkillRating('mad scientist')), context.player, context.target);
            }
        });
    }
}

WilliamSpecks.code = '05011';

module.exports = WilliamSpecks;

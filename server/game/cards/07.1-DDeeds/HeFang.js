const DudeCard = require('../../dudecard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class HeFang extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: He Fang',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose abomination',
                cardCondition: { 
                    location: 'hand', 
                    controller: 'current', 
                    condition: card => card.hasKeyword('abomination') && !card.isGadget()
                },
                cardType: ['dude']
            },
            handler: context => {
                this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                    playType: 'ability',
                    abilitySourceType: 'card',
                    reduceAmount: 2,
                    targetLocationUuid: this.gamelocation
                }, () => {
                    this.game.addMessage('{0} uses {1} to put {2} into play', context.player, this, context.target);
                }), context.player, context.target);  
            }
        });
    }
}

HeFang.code = '11005';

module.exports = HeFang;

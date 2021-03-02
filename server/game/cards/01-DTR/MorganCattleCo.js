const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class MorganCattleCo extends OutfitCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Morgan Cattle Co.',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot({
                    type: 'dude',
                    location: 'play area',
                    controller: 'current'
                })
            ],
            target: {
                activePromptTitle: 'Select deed to play',
                cardCondition: { location: 'hand' },
                cardType: ['deed']
            },
            handler: context => {
                let bootedDude = context.costs.boot;
                this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(bootedDude.influence, () => {
                    if(context.target.location === 'play area') {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: bootedDude, 
                            targetUuid: context.target.uuid, 
                            options: { needToBoot: false, allowBooted: true }
                        })).thenExecute(() => 
                            this.game.addMessage('{0} uses {1} to put {2} into play and to move {3} there.', context.player, this, context.target, bootedDude));
                    }
                }), context.player, context.target);
            }
        });
    }
}

MorganCattleCo.code = '01003';

module.exports = MorganCattleCo;

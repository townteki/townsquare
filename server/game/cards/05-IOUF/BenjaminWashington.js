const PhaseNames = require('../../Constants/PhaseNames.js');
const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BenjaminWashington extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Benjamin Washington',
            grifter: true,
            cost: ability.costs.bootSelf(),
            handler: context => {
                context.player.discardFromHand(0, discarded => {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: `Choose ${discarded.length} cards`,
                        cardCondition: { 
                            location: 'play area', 
                            controller: 'current'
                        },
                        multiSelect: true,
                        numCards: discarded.length,
                        cardType: 'dude',
                        onSelect: (player, dudes) => {
                            this.untilEndOfPhase(context.ability, ability => ({
                                match: dudes,
                                effect: ability.effects.modifyUpkeep(-2)
                            }), PhaseNames.Upkeep);
                            this.game.addMessage('{0} uses {1} and discards {2} to give {3} -2 upkeep until High Noon', 
                                player, this, discarded, dudes);
                            return true;
                        },
                        source: this,
                        context
                    });
                }, {}, context);
                context.player.drawCardsToHand(1, context);
                this.game.addMessage('{0} uses {1} to draw a card', context.player, this);
            }
        });
    }
}

BenjaminWashington.code = '09003';

module.exports = BenjaminWashington;

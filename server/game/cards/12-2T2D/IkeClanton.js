const PhaseNames = require('../../Constants/PhaseNames.js');
const DudeCard = require('../../dudecard.js');

class IkeClanton extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Ike Clanton',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select deed to become Rowdy',
                cardCondition: { location: 'play area', controller: 'any' },
                cardType: ['deed']
            },
            message: context => this.game.addMessage('{0} uses {1} to give Rowdy keyword to {2}', context.player, this, context.target),
            handler: context => {
                this.untilEndOfPhase(context.ability, ability => ({
                    condition: () => true,
                    match: context.target,
                    effect: ability.effects.addKeyword('rowdy')
                }), PhaseNames.Upkeep
                );
            }
        });
    }
}

IkeClanton.code = '20026';

module.exports = IkeClanton;

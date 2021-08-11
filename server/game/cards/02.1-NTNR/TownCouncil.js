const DeedCard = require('../../deedcard.js');

class TownCouncil extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Town Council',
            when: {
                onLowballWinnerDetermined: event => event.winner === this.controller
            },
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to give {2} +3 influence until after next Noon play', 
                    context.player, this, context.target),
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onAbilityResolutionFinished: event => event.ability &&
                            (event.ability.playTypePlayed() === 'noon' ||
                            event.ability.abilitySourceType === 'game'),
                        onPassAction: () => true
                    },
                    match: context.target,
                    effect: ability.effects.modifyInfluence(3)
                }));
            }
        });
    }
}

TownCouncil.code = '02011';

module.exports = TownCouncil;

const DeedCard = require('../../deedcard.js');

class CliffsNo4Saloon extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Cliff\'s #4 Saloon',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => 
                        card.gamelocation === this.gamelocation ||
                        card.isAdjacent(this.gamelocation) &&
                        card.isInControlledLocation()
                },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.setAsStud()
                    ]
                }));
                this.game.addMessage('{0} uses {1} to make {2} a stud', context.player, this, context.target);
            }
        });
    }
}

CliffsNo4Saloon.code = '18025';

module.exports = CliffsNo4Saloon;

const DeedCard = require('../../deedcard.js');

class IkesPlace extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Ike\'s Place',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a deed',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any',
                    condition: card => card.controller === this.controller || this.isSameStreet(card)  
                },
                cardType: ['deed']
            },
            message: context => this.game.addMessage('{0} uses {1} to reduce {2}\'s CP and production to 0 until after Upkeep', context.player, this, context.target),
            handler: context => {
                this.untilEndOfPhase(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.setProduction(0),
                        ability.effects.setControl(0)
                        
                    ]
                }), 'upkeep');
            }
        });
    }
}

IkesPlace.code = '20034';

module.exports = IkesPlace;

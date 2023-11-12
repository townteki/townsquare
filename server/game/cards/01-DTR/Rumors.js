const ActionCard = require('../../actioncard.js');

class Rumors extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Rumors',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'any' },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to bad-mouth {2} and give them -1 influence while not at home', 
                    context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    targetController: 'any',
                    condition: () => 
                        !this.game.isHome(context.target.gamelocation, context.target.controller),
                    match: card => card.equals(context.target),
                    effect: ability.effects.modifyInfluence(-1)
                }));
            }
        });
    }
}

Rumors.code = '01128';

module.exports = Rumors;

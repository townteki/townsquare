const GameActions = require('../../GameActions');
const TechniqueCard = require('../../techniquecard');

class RakingDragons extends TechniqueCard {
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Raking Dragons',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            combo: context => {
                if(!this.comboTarget) {
                    return false;
                }
                return context.kfDude.value > this.comboTarget.value;
            },
            onSuccess: context => {
                this.comboTarget = context.target;
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyValue(-2)
                }));
                this.game.addMessage('{0} uses {1} to boot {2} and give them -2 value', context.player, this, context.target);
                return true;
            },
            source: this
        });
    }
}

RakingDragons.code = '09038';

module.exports = RakingDragons;

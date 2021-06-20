const GameActions = require('../../GameActions');
const TechniqueCard = require('../../techniquecard');

class RakingDragons extends TechniqueCard {
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Raking Dragons',
            playType: ['shootout'],
            combo: context => {
                if(!context.dragonTarget) {
                    return false;
                }
                return context.kfDude.value > context.dragonTarget.value;
            },
            onSuccess: (context) => {
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Select a dude',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.isParticipating(),
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        context.dragonTarget = card;
                        this.game.resolveGameAction(GameActions.bootCard({ card }), context);
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: card,
                            effect: ability.effects.modifyValue(-2)
                        }));
                        this.game.addMessage('{0} uses {1} to boot {2} and give them -2 value', player, this, card);
                        return true;
                    },
                    source: this
                });                
            },
            source: this
        });
    }
}

RakingDragons.code = '09038';

module.exports = RakingDragons;

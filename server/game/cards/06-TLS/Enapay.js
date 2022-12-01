const PhaseNames = require('../../Constants/PhaseNames.js');
const DudeCard = require('../../dudecard.js');

class Enapay extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.currentPhase === PhaseNames.HighNoon ||
                this.game.currentPhase === PhaseNames.Shootout,
            match: this,
            effect: ability.effects.modifyInfluence(2)
        });

        this.action({
            title: 'Raise a dude\'s influence',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude',
                waitingPromptTitle: 'Waiting for opponent to choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    condition: card => !card.equals(this) &&
                        card.gamelocation === this.gamelocation 
                },
                cardType: 'dude'
            },
            message: context => this.game.addMessage('{0} boots {1} to give {2} +1 influence', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyInfluence(1)
                }));           
            }
        });
    }
}

Enapay.code = '10008';

module.exports = Enapay;

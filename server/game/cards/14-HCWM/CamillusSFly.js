const PhaseNames = require('../../Constants/PhaseNames.js');
const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class CamillusSFly extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.reaction({
            title: 'React: Camillus S. Fly',
            when: {
                onCardEntersPlay: event => event.card === this && this.game.currentPhase === PhaseNames.HighNoon
            },
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card !== this 
                },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to make {2} a stud', 
                context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setAsStud()
                }));
            }
        });
    }
}

CamillusSFly.code = '22028';

module.exports = CamillusSFly;

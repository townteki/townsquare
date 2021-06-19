const DudeCard = require('../../dudecard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class AgentProvocateur extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: [
                ability.effects.cannotBeMoved(),
                ability.effects.cannotAttachCards()
            ]
        });

        this.reaction({
            title: 'Agent Provocateur',
            when: {
                onSundownAfterVictoryCheck: () => true
            },
            cost: ability.costs.aceSelf(),
            target: {
                activePromptTitle: 'Choose a dude to play',
                cardCondition: { location: 'hand', controller: 'current' },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to play {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(4), context.player, context.target);
            }
        });
    }
}

AgentProvocateur.code = '19018';

module.exports = AgentProvocateur;

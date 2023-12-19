const DudeCard = require('../../dudecard.js');
const PhaseNames = require('../../Constants/PhaseNames.js');

class OldManMcDroste extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => this.isAtDeed('out-town'),
            match: this,
            effect: ability.effects.modifyControl(1)
        });
        this.persistentEffect({
            targetController: 'any',
            condition: () => this.isAtDeed(),
            match: card => card.equals(this.locationCard),
            effect: ability.effects.modifyProduction(-3)
        });
        this.action({
            title: 'Old Man McDroste',
            playType: 'noon',
            condition: () => this.isAtDeed(), 
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude to de-influence',
                cardCondition: {
                    controller: 'any',
                    condition: card => card.gamelocation === this.gamelocation
                },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to set {2}\'s influence to 0',
                context.player, this, context.target),
            handler: context => {
                this.untilEndOfPhase(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.setInfluence(0)
                }), PhaseNames.Upkeep
                );
            }
        });
    }
}

OldManMcDroste.code = '08009';

module.exports = OldManMcDroste;

const DudeCard = require('../../dudecard.js');

class MortimerParsons extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout && this.isParticipating() && this.controller.isCheatin()
            },
            message: context =>
                this.game.addMessage('{0}\'s cheatin\' hand sends {1} home booted and reduces {1}\'s influence to 0', context.player, this),
            handler: context => {
                if(this.influence > 0) {
                    this.untilEndOfRound(context.ability, ability => ({
                        match: this,
                        effect: ability.effects.setInfluence(0)
                    }));
                }
                this.game.shootout.sendHome(this, context);
                if(this.game.shootout.checkEndCondition()) {
                    this.game.shootout.cancelStep();
                }
            }
        });
    }
}

MortimerParsons.code = '03003';

module.exports = MortimerParsons;

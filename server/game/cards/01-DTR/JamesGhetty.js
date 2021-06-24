const DudeCard = require('../../dudecard.js');

class JamesGhetty extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout,
            match: this,
            effect: ability.effects.canSpendGhostRock(spendParams =>
                spendParams.activePlayer === this.controller && this.isShootoutAbility(spendParams)
            )
        });
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => event.card === this
            },
            handler: () => {
                this.ghostrock = 4;
                this.game.onceConditional('onShootoutPhaseFinished', {}, () => this.ghostrock = 0);
            }
        }); 
    }

    isShootoutAbility(spendParams) {
        if(!spendParams.context || !spendParams.context.ability) {
            return false;
        }
        return spendParams.context.ability.playTypePlayed(spendParams.context) === 'shootout';
    }
}

JamesGhetty.code = '01028';

module.exports = JamesGhetty;

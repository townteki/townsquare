const DudeCard = require('../../dudecard.js');

class JamesGhetty extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout,
            match: this,
            effect: ability.effects.canSpendGhostRock(spendParams =>
                spendParams.activePlayer === this.controller &&
                spendParams.context && spendParams.context.ability &&
                (spendParams.context.ability.playType === 'shootout' || spendParams.context.ability.playType === 'shootout:join')
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
}

JamesGhetty.code = '01028';

module.exports = JamesGhetty;

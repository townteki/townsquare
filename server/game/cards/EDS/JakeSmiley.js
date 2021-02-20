const DudeCard = require('../../dudecard.js');

class JakeSmiley extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.currentPhase === 'sundown',
            match: this,
            effect: ability.effects.modifyInfluence(2)
        });
    }
}

JakeSmiley.code = '04009';

module.exports = JakeSmiley;

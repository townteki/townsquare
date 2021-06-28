const DudeCard = require('../../dudecard.js');

class JackieSanjuro extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout && this.isParticipating() &&
                this.game.shootout.getPosseByPlayer(this.controller).getDudes().length === 1,
            match: this,
            effect: [
                ability.effects.modifyValue(4),
                ability.effects.setAsStud()
            ]
        });

        this.persistentEffect({
            match: this,
            effect: ability.effects.cannotAttachCards(this, attachment => !attachment.hasKeyword('melee'))
        });
    }
}

JackieSanjuro.code = '22018';

module.exports = JackieSanjuro;

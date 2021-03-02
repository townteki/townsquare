const DudeCard = require('../../dudecard.js');

class ClementineLepp extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            condition: () => this.locationCard.hasKeyword('Saloon') && this.locationCard.owner === this.controller,
            match: this,
            effect: [
                ability.effects.modifyInfluence(1),
                ability.effects.cannotBeCalledOut()
            ]
        });
    }
}

ClementineLepp.code = '01045';

module.exports = ClementineLepp;

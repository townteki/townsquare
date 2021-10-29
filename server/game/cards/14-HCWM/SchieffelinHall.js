const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class SchieffelinHall extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => this.game.shootout && this.game.shootout.shootoutLocation.uuid === this.gamelocation,
            match: this,
            effect: ability.effects.useInfluenceForShootout()
        });
    }
}

SchieffelinHall.code = '22037';

module.exports = SchieffelinHall;

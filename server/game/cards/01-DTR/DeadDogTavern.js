const DeedCard = require('../../deedcard.js');

class DeadDogTavern extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.determineControlByBullets()
        });
    }
}

DeadDogTavern.code = '01062';

module.exports = DeadDogTavern;

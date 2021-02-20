const DeedCard = require('../../deedcard.js');

class MazaGangHideout extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: [
                ability.effects.preventAdjacency(this.game.townsquare, this.uuid)
            ]
        });
        this.persistentEffect({
            match: this,
            effect: [
                ability.effects.dynamicProduction(() => this.adjacentLocations().length)
            ]
        });
    }
}

MazaGangHideout.code = '11014';

module.exports = MazaGangHideout;

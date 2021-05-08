const GoodsCard = require('../../goodscard.js');

class Peacemaker extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: [
                ability.effects.cannotBeSetToDrawByShootout('opponent'),
                ability.effects.cannotDecreaseBulletsByShootout('opponent')
            ]
        });
    }
}

Peacemaker.code = '01083';

module.exports = Peacemaker;

const DudeCard = require('../../dudecard.js');

class YunxuJiang extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isParticipating() && (this.game.shootout.shootoutLocation.controller === this.controller || this.getGameLocation().isHome(this.controller)),
            match: card => card.isParticipating() && card.controller === this.controller && card !== this,
            gameAction: 'increaseBullets',
            effect: [
                ability.effects.modifyBullets(1),
                ability.effects.modifyValue(1)
            ]
        });
    }
}

YunxuJiang.code = '09012';

module.exports = YunxuJiang;

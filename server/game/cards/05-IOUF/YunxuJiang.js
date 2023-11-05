const DudeCard = require('../../dudecard.js');

class YunxuJiang extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isParticipating() && 
                (this.game.getShootoutLocationCard().controller.equals(this.controller) || this.game.isHome(this.gamelocation, this.controller)),
            match: card => card.getType() === 'dude' && card.isParticipating() && card.controller.equals(this.controller) && !card.equals(this),
            effect: [
                ability.effects.modifyBullets(1),
                ability.effects.modifyValue(1)
            ]
        });
    }
}

YunxuJiang.code = '09012';

module.exports = YunxuJiang;

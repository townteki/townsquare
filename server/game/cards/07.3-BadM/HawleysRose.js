const PhaseNames = require('../../Constants/PhaseNames.js');
const GoodsCard = require('../../goodscard.js');

class HawleysRose extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.addKeyword('abomination')
        });
        this.whileAttached({
            condition: () => this.game.currentPhase === PhaseNames.Sundown,
            effect: ability.effects.modifyInfluence(1)
        });
        this.whileAttached({
            condition: () => this.game.currentPhase === PhaseNames.Sundown && this.areOpposingDudesAtDeed(),
            effect: ability.effects.modifyInfluence(1)
        });
    }

    areOpposingDudesAtDeed() {
        const gameLocation = this.getGameLocation();
        if(!gameLocation) {
            return false;
        }
        if(gameLocation.locationCard.getType() !== 'deed') {
            return false;
        }
        return gameLocation.getDudes().find(dude => !dude.controller.equals(this.controller));
    }
}

HawleysRose.code = '13013';

module.exports = HawleysRose;

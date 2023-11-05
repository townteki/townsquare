const PhaseNames = require('../Constants/PhaseNames');
const PlayingTypes = require('../Constants/PlayingTypes');
const PutIntoPlayCardAction = require('./PutIntoPlayCardAction');

class ShoppinCardAction extends PutIntoPlayCardAction {
    constructor(targetLocationUuid = '', targetProperties) {
        super({ 
            playType: PlayingTypes.Shoppin, 
            abilitySourceType: 'game', 
            targetLocationUuid,
            targetProperties
        });
        this.title = 'Play';
    }

    isAction() {
        return true;
    }

    meetsRequirements(context) {
        if(!super.meetsRequirements(context)) {
            return false;
        }
        return context.game.currentPhase === PhaseNames.HighNoon;
    }
}

module.exports = ShoppinCardAction;

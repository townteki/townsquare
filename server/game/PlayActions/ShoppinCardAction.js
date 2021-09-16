const PutIntoPlayCardAction = require('./PutIntoPlayCardAction');

class ShoppinCardAction extends PutIntoPlayCardAction {
    constructor(targetLocationUuid = '', targetProperties) {
        super({ 
            playType: 'shoppin', 
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
        return context.game.currentPhase === 'high noon';
    }
}

module.exports = ShoppinCardAction;

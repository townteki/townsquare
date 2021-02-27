const PutIntoPlayCardAction = require('./PutIntoPlayCardAction');

class ShoppinCardAction extends PutIntoPlayCardAction {
    constructor(target = '') {
        super({ 
            playType: 'shoppin', 
            sourceType: 'game', 
            target: target 
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

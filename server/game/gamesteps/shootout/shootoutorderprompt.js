const PlayerOrderPrompt = require('../playerorderprompt.js');

class ShootoutOrderPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder) {
        super(game, playerNameOrder);
        this.name = 'shootoutPrompt';
    }

    skipCondition() {
        if(!this.game.shootout || this.game.shootout.cancelled) {
            return true;
        }
        return super.skipCondition();
    }    

    isComplete() {
        if(!this.game.shootout || this.game.shootout.cancelled) {
            return true;
        }
        return super.isComplete();
    }
}

module.exports = ShootoutOrderPrompt;

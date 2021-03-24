const PlayTypeAbility = require('../playTypeAbility');

class CustomPlayAction extends PlayTypeAbility {
    constructor(game, properties) {
        super(properties);
        this.game = game;
        this.condition = properties.condition || (() => true);
        this.handler = properties.handler;
        this.title = properties.title;
    }

    meetsRequirements(context) {
        return this.condition(context);
    }

    executeHandler(context) {
        this.handler(context);
    }

    isAction() {
        return false;
    }

    isCardAbility() {
        return false;
    }
}

module.exports = CustomPlayAction;

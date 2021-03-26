const PlayTypeAbility = require('../playTypeAbility');

class CustomPlayAction extends PlayTypeAbility {
    constructor(game, card, properties) {
        super(game, card, properties);
        this.condition = properties.condition || (() => true);
        this.handler = properties.handler;
        this.title = properties.title;
    }

    meetsRequirements(context) {
        if(!super.meetsRequirements(context)) {
            return false;
        }
        return this.condition(context);
    }

    executeHandler(context) {
        this.handler(context);
    }

    isAction() {
        return true;
    }

    isCardAbility() {
        return false;
    }
}

module.exports = CustomPlayAction;

const GameAction = require('./GameAction');

class CallOut extends GameAction {
    constructor() {
        super('callout');
    }

    canChangeGameState({ caller, callee, isCardEffect = true }) {
        return ['outfit', 'play area'].includes(caller.location) && 
            ['outfit', 'play area'].includes(callee.location) && 
            (isCardEffect || !caller.booted);
    }

    createEvent({ caller, callee, isCardEffect = true, canReject = true }) {
        return this.event('onCardCallOut', { caller: caller, callee: callee, isCardEffect: isCardEffect, canReject: canReject }, event => {
            event.caller.callOut(event.callee, event.canReject);
        });
    }
}

module.exports = new CallOut();

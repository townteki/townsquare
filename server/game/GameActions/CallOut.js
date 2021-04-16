const GameAction = require('./GameAction');

class CallOut extends GameAction {
    constructor() {
        super('callout');
    }

    canChangeGameState({ caller, callee, isCardEffect = true }) {
        return ['outfit', 'play area'].includes(caller.location) && 
            ['outfit', 'play area'].includes(callee.location) && 
            (isCardEffect || !caller.booted) &&
            callee.canBeCalledOut();
    }

    createEvent({ caller, callee, isCardEffect = true, canReject = true }) {
        return this.event('onCardCallOutFinished', { caller: caller, callee: callee, isCardEffect: isCardEffect, canReject: canReject }, event => {
            event.caller.callOut(event.callee, event.canReject);
        }).thenExecute(event => {
            if(event.caller.acceptedCallout) {
                event.caller.game.startShootout(event.caller, event.callee);
            }
        });
    }
}

module.exports = new CallOut();

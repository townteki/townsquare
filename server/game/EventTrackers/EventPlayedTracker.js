class EventPlayedTracker {
    static forPhase(game) {
        return new EventPlayedTracker(game, 'onPhaseEnded');
    }

    constructor(game, endingEvent) {
        this.events = [];
        game.on('onCardAbilityInitiated:cancelreaction', event => this.trackEvent(event));
        game.on(endingEvent, () => this.clearEvents());
    }

    trackEvent(event) {
        if(event.source.getType() !== 'event' || this.events.includes(event)) {
            return;
        }

        this.events.push(event);
    }

    clearEvents() {
        this.events = [];
    }

    getNumberOfPlayedEvents(player) {
        return this.events.reduce((count, event) => {
            return event.player === player ? count + 1 : count;
        }, 0);
    }
}

module.exports = EventPlayedTracker;

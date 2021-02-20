class GenericTracker {
    static forPhase(game, startingEvent, eventCondition = () => true) {
        return new GenericTracker(game, startingEvent, 'onPhaseEnded', eventCondition);
    }

    static forRound(game, startingEvent, eventCondition = () => true) {
        return new GenericTracker(game, startingEvent, 'onRoundEnded', eventCondition);
    }

    constructor(game, startingEvent, endingEvent, eventCondition = () => true) {
        this.events = [];
        this.eventCondition = eventCondition;

        game.on(startingEvent, event => this.trackEvent(event));
        game.on(endingEvent, () => this.clearEvents());
    }

    eventHappened(predicate = () => true) {
        return this.events.some(event => predicate(event));
    }

    numberOfEventsHappened(predicate = () => true) {
        return this.events.filter(event => predicate(event)).length;
    }

    trackEvent(event) {
        if(this.eventCondition(event)) {
            this.events.push(event);
        }
    }

    clearEvents() {
        this.events = [];
    }
}

module.exports = GenericTracker;

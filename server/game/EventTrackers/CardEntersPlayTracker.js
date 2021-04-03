class CardEntersPlayTracker {
    static forPhase(game, condition) {
        return new CardEntersPlayTracker(game, 'onPhaseEnded', condition);
    }

    constructor(game, endingEvent, condition = () => true) {
        this.events = [];

        game.on('onCardEntersPlay', event => {
            if(condition(event)) {
                this.trackEvent(event);
            }
        });
        game.on(endingEvent, () => this.clearEvents());
    }

    trackEvent(event) {
        this.events.push(event);
    }

    clearEvents() {
        this.events = [];
    }
}

module.exports = CardEntersPlayTracker;

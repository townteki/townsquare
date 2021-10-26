class ReactTimer {
    constructor(event, abilityType) {
        this.event = event;
        this.abilityType = abilityType;
    }

    isEnabled(player) {
        return player.isTimerEnabled() && this.isReactableEvent(player);
    }

    isReactableEvent(player) {
        return this.event.getConcurrentEvents().some(event => {
            return (
                !event.cancelled &&
                event.name === this.event.name &&
                (player.timerSettings.abilities ||
                this.isActionEligibleForEvent(player))
            );
        });
    }

    isActionEligibleForEvent(player) {
        if(!player.timerSettings.actions || player.noTimer || !player.hand.length) {
            return false;
        }
        return player.allCards.some(card => 
            card.getType() === 'action' && card.hasReactionFor(this.event, this.abilityType));
    }
}

module.exports = ReactTimer;

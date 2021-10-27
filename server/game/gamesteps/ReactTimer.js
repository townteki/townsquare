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
                this.isActionEligibleForEvent(player)
            );
        });
    }

    isActionEligibleForEvent(player) {
        if(player.noTimer || !player.hand.length) {
            return false;
        }
        let cardPool = [];
        if(player.timerSettings.actions) {
            cardPool = player.timerSettings.actionsInHand ? player.hand : player.allCards;
        }
        return cardPool.some(card => 
            card.getType() === 'action' && card.hasReactionFor(this.event, this.abilityType));
    }
}

module.exports = ReactTimer;

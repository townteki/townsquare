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
                this.isActionEligibleForEvent(player, event)
            );
        });
    }

    isActionEligibleForEvent(player, event) {
        if(player.noTimer || !player.hand.length) {
            return false;
        }
        const actionsEnabled = player.timerSettings.actions && player.allCards.some(card => 
            card.getType() === 'action' && card.hasReactionFor(this.event, this.abilityType));
        const shootoutAbilitiesEnabled = event.name === 'onAbilityResolutionStarted' && 
            this.abilityType === 'beforereaction' &&
            event.context.player !== player &&
            player.timerSettings.shootoutAbilities && 
            ['shootout', 'shootout:join', 'resolution'].includes(event.ability.playTypePlayed());

        return actionsEnabled || shootoutAbilitiesEnabled;
    }
}

module.exports = ReactTimer;

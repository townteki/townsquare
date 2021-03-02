const BaseAbility = require('./baseability.js');
const Costs = require('./costs.js');
const TriggeredAbilityContext = require('./TriggeredAbilityContext.js');

class TriggeredAbility extends BaseAbility {
    constructor(game, card, eventType, properties) {
        super(properties);

        this.game = game;
        this.card = card;
        this.when = properties.when;
        this.playerFunc = properties.player || (() => this.card.controller);
        this.eventType = eventType;
        this.location = this.buildLocation(card, properties.location);

        if(card.getType() === 'action' && !properties.ignoreEventCosts) {
            this.cost = this.cost.concat(Costs.playAction());
        }
    }

    isTriggeredAbility() {
        return true;
    }

    buildLocation(card, location) {
        const DefaultLocationForType = {
            action: 'hand'
        };

        let defaultedLocation = location || DefaultLocationForType[card.getType()] || ['play area'];

        if(!Array.isArray(defaultedLocation)) {
            return [defaultedLocation];
        }

        return defaultedLocation;
    }

    eventHandler(event) {
        if(!this.isTriggeredByEvent(event)) {
            return;
        }

        this.game.registerAbility(this, event);
    }

    createContext(event) {
        return new TriggeredAbilityContext({
            ability: this,
            event: event,
            game: this.game,
            source: this.card,
            player: this.playerFunc()
        });
    }

    triggersFor(eventName) {
        return !!this.when[eventName];
    }

    isTriggeredByEvent(event) {
        let listener = this.when[event.name];

        if(!listener || event.cancelled) {
            return false;
        }

        if(event.ability && !!event.ability.cannotBeCanceled && this.eventType === 'cancelinterrupt') {
            return;
        }

        return listener(event);
    }

    meetsRequirements(context) {
        let isPlayableActionAbility = this.isPlayableActionAbility();

        if(this.game.currentPhase === 'setup' && !this.card.hasKeyword('grifter')) {
            return false;
        }

        if(this.isCardAbility() && !this.isForcedAbility() && context.player && !context.player.canTrigger(this)) {
            return false;
        }

        if(this.usage && this.usage.isUsed()) {
            return false;
        }

        if(this.card.isAnyBlank()) {
            return false;
        }

        if(!this.isTriggeredByEvent(context.event)) {
            return false;
        }

        if(isPlayableActionAbility && !context.player.isCardInPlayableLocation(this.card, 'play')) {
            return false;
        }

        if(!isPlayableActionAbility && !this.location.includes(this.card.location)) {
            return false;
        }

        if(!this.canResolvePlayer(context) || !this.canPayCosts(context) || !this.canResolveTargets(context)) {
            return false;
        }

        return true;
    }

    isEventListeningLocation(location) {
        // Reactions / interrupts for playable event cards need to listen for
        // game events in all open information locations plus while in hand.
        // The location property of the ability will prevent it from firing in
        // inappropriate locations when requirements are checked for the ability.
        if(this.isPlayableActionAbility()) {
            return ['discard pile', 'draw deck', 'hand', 'play area'].includes(location);
        }

        return this.location.includes(location);
    }

    isPlayableActionAbility() {
        return this.card.getType() === 'action' && this.location.includes('hand');
    }

    incrementLimit() {
        if(!this.location.includes(this.card.location)) {
            return;
        }

        super.incrementLimit();
    }

    registerEvents() {
        if(this.events) {
            return;
        }

        var eventNames = Object.keys(this.when);

        this.events = [];
        for(let eventName of eventNames) {
            var event = {
                name: eventName + ':' + this.eventType,
                handler: event => this.eventHandler(event)
            };
            this.game.on(event.name, event.handler);
            this.events.push(event);
        }

        if(this.usage) {
            this.usage.registerEvents(this.game);
        }
    }

    unregisterEvents() {
        if(this.events) {
            for(let event of this.events) {
                this.game.removeListener(event.name, event.handler);
            }
            if(this.usage) {
                this.usage.unregisterEvents(this.game);
            }
            this.events = null;
        }
    }
}

module.exports = TriggeredAbility;

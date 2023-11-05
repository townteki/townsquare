const BaseAbility = require('./baseability.js');
const PlayingTypes = require('./Constants/PlayingTypes.js');
const Costs = require('./costs.js');
const HandlerGameActionWrapper = require('./GameActions/HandlerGameActionWrapper.js');
const TriggeredAbilityContext = require('./TriggeredAbilityContext.js');

class TriggeredAbility extends BaseAbility {
    constructor(game, card, eventType, properties) {
        super(properties);

        this.game = game;
        this.card = card;
        this.when = properties.when;
        if(properties.grifter && !properties.when) {
            this.when = {
                onSetupFinished: () => this.card.controller.availableGrifterActions > 0
            };
        }
        this.playerFunc = properties.player || (player => this.card.controller.equals(player) || this.card.canUseControllerAbilities(player));
        this.eventType = eventType;
        this.location = this.buildLocation(card, properties.location);

        if(card.getType() === 'action' && !properties.ignoreActionCosts) {
            this.cost = this.cost.concat(Costs.playAction());
        }

        if(!this.gameAction) {
            if(card.getType() !== 'spell') {
                throw new Error('Reactions must have a `gameAction` or `handler` property.');
            } else {
                this.gameAction = new HandlerGameActionWrapper({ handler: () => true });
            }
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
        let players = this.game.getPlayers().filter(player => this.playerFunc(player));
        let contexts = players.map(player => 
            new TriggeredAbilityContext({
                ability: this,
                event: event,
                game: this.game,
                source: this.card,
                player: player
            }));
        return contexts;
    }

    triggersFor(eventName) {
        return !!this.when[eventName];
    }

    isTriggeredByEvent(event) {
        let listener = this.when[event.name];

        if(!listener || event.cancelled) {
            return false;
        }

        return listener(event);
    }

    meetsRequirements(context) {
        if(!super.meetsRequirements(context)) {
            return false;
        }
        let isPlayableActionAbility = this.isPlayableActionAbility();

        if(this.isCardAbility() && !this.isTraitAbility() && context.player && !context.player.canTrigger(this)) {
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

        if(isPlayableActionAbility && !this.isConditionCardInPlay() && !context.player.isCardInPlayableLocation(this.card, PlayingTypes.Play)) {
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
        // Reactions for playable event cards need to listen for
        // game events in all open information locations plus while in hand.
        // The location property of the ability will prevent it from firing in
        // inappropriate locations when requirements are checked for the ability.
        if(this.isPlayableActionAbility()) {
            return ['hand', 'play area'].includes(location);
        }

        return this.location.includes(location);
    }

    isPlayableActionAbility() {
        return this.card.getType() === 'action' && this.location.includes('hand');
    }

    isConditionCardInPlay() {
        return this.card.location === 'play area' && this.card.hasKeyword('condition');
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

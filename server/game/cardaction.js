const AbilityMessage = require('./AbilityMessage.js');
const AbilityUsage = require('./abilityusage.js');
const Costs = require('./costs.js');
const EventRegistrar = require('./eventregistrar.js');
const HandlerGameActionWrapper = require('./GameActions/HandlerGameActionWrapper.js');
const PlayTypeAbility = require('./playTypeAbility.js');

const CardTypesForShootout = ['dude', 'goods', 'spell'];

/**
 * Represents an action ability provided by card text.
 *
 * Properties:
 * title        - string that is used within the card menu associated with this
 *                action.
 * condition    - optional function that should return true when the action is
 *                allowed, false otherwise. It should generally be used to check
 *                if the action can modify game state (step #1 in ability
 *                resolution in the rules).
 * cost         - object or array of objects representing the cost required to
 *                be paid before the action will activate. See Costs.
 * phase        - string representing which phases the action may be executed.
 *                Defaults to 'any' which allows the action to be executed in
 *                any phase.
 * location     - string indicating the location the card should be in in order
 *                to activate the action. Defaults to 'play area'.
 * limit        - the max number of uses for the repeatable action.
 * triggeringPlayer - string indicating player that can execute the action.
 *                Default is 'controller', other possible values are 'owner' or 'any'
 * clickToActivate - boolean that indicates the action should be activated when
 *                   the card is clicked.
 */
class CardAction extends PlayTypeAbility {
    constructor(game, card, properties, isJob = false) {
        super(game, card, properties);
        this.title = properties.title;
        if(this.isCardAbility()) {
            this.usage = new AbilityUsage(properties, this.playType);
        }
        this.condition = properties.condition;
        this.ifCondition = properties.ifCondition;
        this.ifFailMessage = properties.ifFailMessage;
        this.clickToActivate = !!properties.clickToActivate;
        this.actionContext = properties.actionContext;
        if(properties.location) {
            if(Array.isArray(properties.location)) {
                this.location = properties.location;
            } else {
                this.location = [properties.location];
            }
        } else if(card.getType() === 'action') {
            this.location = ['hand'];
        } else {
            this.location = ['play area'];
        }
        this.events = new EventRegistrar(game, this);
        this.activationContexts = [];

        if(card.getType() === 'action') {
            this.cost = this.cost.concat(Costs.playAction());
        }

        if(!this.gameAction) {
            if(card.getType() !== 'spell' && !isJob) {
                throw new Error('Actions must have a `gameAction` or `handler` property.');
            } else {
                this.gameAction = new HandlerGameActionWrapper({ handler: () => true });
            }
        }
    }

    defaultCondition() {
        if(this.playType.includes('cheatin resolution')) {
            return this.card.controller.canPlayCheatinResolution();
        }
        if(this.game.isShootoutPlayWindow() && !this.playType.includes('shootout:join') && CardTypesForShootout.includes(this.card.getType())) {
            return this.game.shootout.isInShootout(this.card);
        }
        return true;
    }

    isLocationValid(location) {
        return this.location.includes(location);
    }

    allowMenu() {
        return this.isLocationValid(this.card.location);
    }

    allowGameAction(context) {
        if(!this.gameAction.allow(context)) {
            return false;
        }
        if(!this.actionContext || !this.actionContext.card || !this.actionContext.gameAction) {
            return true;
        }
        if(typeof(this.gameAction) === 'function') {
            return this.actionContext.card.allowGameAction(this.gameAction(context), context);
        }
        if(!Array.isArray(this.actionContext.gameAction)) {
            return this.actionContext.card.allowGameAction(this.actionContext.gameAction, context);
        }
        return this.actionContext.gameAction.every(gameAction => this.actionContext.card.allowGameAction(gameAction, context));
    }

    meetsRequirements(context) {
        if(!super.meetsRequirements(context)) {
            return false;
        }

        if(this.card.hasKeyword('headline') && this.game.shootout.headlineUsed) {
            return false;
        }

        if(this.isCardAbility() && !context.player.canTrigger(this)) {
            return false;
        }

        if(!this.options.allowUsed && this.usage.isUsed()) {
            context.disableIcon = 'hourglass';
            return false;
        }

        if(this.card.getType() === 'action' && !context.player.isCardInPlayableLocation(this.card, 'play')) {
            return false;
        }

        if(this.card.getType() !== 'action' && !this.isLocationValid(this.card.location)) {
            return false;
        }

        if(this.card.isAnyBlank()) {
            return false ;
        }

        if(!this.defaultCondition()) {
            return false;
        }

        if(this.condition && !this.condition(context)) {
            return false;
        }

        if(!this.canResolvePlayer(context)) {
            return false;
        }

        if(!this.canPayCosts(context)) {
            context.disableIcon = 'usd';
            return false;
        }

        if(!this.canResolveTargets(context)) {
            context.disableIcon = 'screenshot';
            return false;
        }

        if(!this.allowGameAction(context)) {
            context.disableIcon = 'ban-circle';
            return false;
        }

        return true;
    }

    // Main execute function that excutes the ability. Once the targets are selected, the executeHandler is called.
    execute(player) {
        var context = this.createContext(player);

        if(!this.meetsRequirements(context)) {
            return false;
        }

        this.activationContexts.push(context);

        this.game.resolveAbility(this, context);

        return true;
    }

    executeHandler(context) {
        if(!this.ifCondition || this.ifCondition(context)) {
            super.executeHandler(context);
        } else {
            let formattedCancelMessage = AbilityMessage.create(this.ifFailMessage || '{player} uses {source} but fails to meet requirements');
            formattedCancelMessage.output(context.game, context);            
        }
        this.usage.increment();
    }

    getMenuItem(arg, player) {
        let context = this.createContext(player);
        let disabled = !this.meetsRequirements(context);
        return { 
            text: this.title, 
            method: 'doAction', 
            arg: arg, 
            triggeringPlayer: this.triggeringPlayer, 
            disabled: disabled,
            menuIcon: context.disableIcon 
        };
    }

    isAction() {
        return true;
    }

    isTriggeredAbility() {
        return true;
    }

    isClickToActivate() {
        return this.clickToActivate;
    }

    isPlayableActionAbility() {
        return this.card.getType() === 'action' && this.isLocationValid('hand');
    }

    incrementLimit() {
        if(!this.isLocationValid(this.card.location)) {
            return;
        }

        super.incrementLimit();
    }

    deactivate(player) {
        if(this.activationContexts.length === 0) {
            return false;
        }

        var context = this.activationContexts[this.activationContexts.length - 1];

        if(!context || player !== context.player) {
            return false;
        }

        if(this.canUnpayCosts(context)) {
            this.unpayCosts(context);
            context.abilityDeactivated = true;
            return true;
        }

        return false;
    }

    onBeginRound() {
        this.activationContexts = [];
    }

    isEventListeningLocation(location) {
        return this.isLocationValid(location);
    }

    registerEvents() {
        this.events.register(['onBeginRound']);
        if(this.usage) {
            this.usage.registerEvents(this.game);
        }
    }

    unregisterEvents() {
        this.events.unregisterAll();
        if(this.usage) {
            this.usage.unregisterEvents(this.game);
        }
    }
}

module.exports = CardAction;

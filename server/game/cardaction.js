const AbilityUsage = require('./abilityusage.js');
const PlayingTypes = require('./Constants/PlayingTypes.js');
const Costs = require('./costs.js');
const EventRegistrar = require('./eventregistrar.js');
const HandlerGameActionWrapper = require('./GameActions/HandlerGameActionWrapper.js');
const PlayTypeAbility = require('./playTypeAbility.js');

const CardTypesForShootout = ['dude', 'goods', 'spell'];

/** @typedef {import('./costs')} Costs */
/** @typedef {import('./AbilityTarget').AbilityTargetProperties} AbilityTargetProperties */
/** @typedef {import('./AbilityContext')} AbilityContext */

/** 
 * @typedef {Object} ActionAbilityProperties 
 * Represents an action ability provided by card text.
 * 
 * Properties:
 * @property {string} title - string that is used within the card menu associated with this action.
 * @property {string | Array.<string>} playType - string or array of strings representing the type
 *                of action (e.g. `noon`, `shootout`, `shootout:join`, `cheatin resolution`).
 * @property {Function} condition - optional function that should return true when the action is
 *                allowed, false otherwise. It should generally be used to check
 *                if the action can modify game state (step #1 in ability
 *                resolution in the rules).
 * @property {boolean} repeatable - If the react action can be repeated. 
 * @property {Costs | Array.<Costs>} cost - object or array of objects representing the cost required to
 *                be paid before the action will activate. See Costs.
 * @property {AbilityTargetProperties} target - object representing card targets for the ability.
 * @property {string} phase - string representing which phases the action may be executed.
 *                Defaults to 'any' which allows the action to be executed in
 *                any phase.
 * @property {string | Array.<string>} location - string indicating the location the card should be in in order
 *                to activate the action. Defaults to 'play area'.
 * @property {string} limit - the max number of uses for the repeatable action.
 * @property {string} triggeringPlayer - string indicating player that can execute the action.
 *                Default is 'controller', other possible values are 'owner' or 'any'
 * @property {(context: AbilityContext) => boolean} handler
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
            if(card.getType() !== 'spell' && !isJob && card.getType() !== 'action' && !card.hasKeyword('technique')) {
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
        if(this.game.shootout && this.game.isShootoutPlayWindow() && !this.playType.includes('shootout:join')) {
            if(this.card.getType() === 'spell' && this.card.isTotem()) {
                return this.game.shootout.shootoutLocation === this.card.getGameLocation();
            }
            if(this.card.getType() === 'goods' && this.card.parent && this.card.parent.getType() === 'outfit') {
                return true;
            }
            if(CardTypesForShootout.includes(this.card.getType())) {
                return this.game.shootout.isInShootout(this.card);
            }
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
        if(typeof(this.actionContext.gameAction) === 'function') {
            return this.actionContext.card.allowGameAction(this.actionContext.gameAction(this.actionContext.card, context), context);
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

        if(this.card.hasKeyword('headline') && this.game.wasHeadlineUsed()) {
            return false;
        }

        if(this.isCardAbility() && !context.player.canTrigger(this)) {
            return false;
        }

        if(!this.options.allowUsed && this.usage.isUsed()) {
            context.disableIcon = 'hourglass';
            return false;
        }

        if(this.card.getType() === 'action') {
            let playingType = context.comboNumber ? PlayingTypes.Combo : PlayingTypes.Play;
            if(!context.player.isCardInPlayableLocation(this.card, playingType)) {
                return false;
            }
        }

        if(this.card.getType() !== 'action' && !this.isLocationValid(this.card.location)) {
            return false;
        }

        if(this.card.isAnyBlank() && this.abilitySourceType !== 'game') {
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
        super.executeHandler(context);
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

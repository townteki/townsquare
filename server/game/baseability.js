const {flatMap} = require('../Array');

const AbilityChoosePlayerDefinition = require('./AbilityChoosePlayerDefinition');
const AbilityUsage = require('./abilityusage');
const AbilityMessage = require('./AbilityMessage');
const AbilityTarget = require('./AbilityTarget.js');
const ChooseGameAction = require('./GameActions/ChooseGameAction');
const HandlerGameActionWrapper = require('./GameActions/HandlerGameActionWrapper');
const BaseCardSelector = require('./CardSelectors/BaseCardSelector');
/** @typedef {import('./AbilityContext')} AbilityContext */

/**
 * Base class representing an ability that can be done by the player. This
 * includes card actions, reactions, playing a card.
 *
 * Most of the methods take a context object. While the structure will vary from
 * inheriting classes, it is guaranteed to have at least the `game` object, the
 * `player` that is executing the action, and the `source` card object that the
 * ability is generated from.
 */
class BaseAbility {
    /**
     * Creates an ability.
     *
     * @param {Object} properties - An object with ability related properties.
     * @param {Object|Array} properties.cost - optional property that specifies
     * the cost for the ability. Can either be a cost object or an array of cost
     * objects.
     */
    constructor(properties) {
        this.cost = this.buildCost(properties.cost);
        this.targets = this.buildTargets(properties);
        this.choosePlayerDefinition = AbilityChoosePlayerDefinition.create(properties);
        this.usage = AbilityUsage.createDefault();
        this.message = AbilityMessage.create(properties.message);
        this.cannotBeCanceled = !!properties.cannotBeCanceled;
        this.abilitySourceType = properties.abilitySourceType || 'card';
        this.gameAction = this.buildGameAction(properties);
        this.cannotBeUsed = false;
        this.printed = !!properties.printed;
        this.defaultOptions = properties.options;
        this.resetOptions();
    }

    resetOptions() {
        if(!this.options) {
            this.options = {};
        }
        if(this.defaultOptions) {
            this.options.skipCost = this.defaultOptions.skipCost;
            this.options.callback = this.defaultOptions.callback;
        }
        this.options.skipCost = this.options.skipCost || (() => false);
        this.options.callback = this.options.callback || (() => true);
    }

    buildCost(cost) {
        if(!cost) {
            return [];
        }

        if(!Array.isArray(cost)) {
            return [cost];
        }

        return cost;
    }

    buildTargets(properties) {
        if(properties.target) {
            let target = properties.target;
            if(typeof(target) === 'string' && BaseCardSelector.isAllowedSpecialTarget(target)) {
                target = { cardType: target, autoSelect: true};
            }
            return [AbilityTarget.create('target', target)];
        }

        if(properties.targets) {
            let targetPairs = Object.entries(properties.targets);
            return targetPairs.map(([name, properties]) => AbilityTarget.create(name, properties));
        }

        return [];
    }

    buildGameAction(properties) {
        if(properties.gameAction) {
            if(properties.target || properties.targets || properties.chooseOpponent || properties.choosePlayer) {
                throw new Error('Cannot use gameAction with abilities with choices');
            }

            return properties.gameAction;
        }

        if(properties.choices) {
            return new ChooseGameAction(properties.choices);
        }

        if(properties.handler) {
            return new HandlerGameActionWrapper({ handler: properties.handler });
        }

        return null;
    }

    canResolve(context) {
        return (
            this.meetsRequirements(context) &&
            this.canResolvePlayer(context) &&
            this.canPayCosts(context) &&
            this.canResolveTargets(context) &&
            this.gameAction.allow(context)
        );
    }

    meetsRequirements() {
        return !this.cannotBeUsed;
    }

    /**
     * Return whether all costs are capable of being paid for the ability.
     *
     * @returns {Boolean}
     */
    canPayCosts(context) {
        return this.executeWithTemporaryContext(context, 'cost', () => this.cost.every(cost => {
            if(this.options.skipCost && this.options.skipCost(cost)) {
                return true;
            }
            return cost.canPay(context);
        }));
    }

    /**
     * Executes the specified callback using the passed ability context and
     * resolution stage. This allows functions to be executed with the proper
     * ability context for immunity / cannot restrictions prior to the ability
     * context being pushed on the game's stack during the full resolution of
     * the ability.
     *
     * @param {AbilityContext} context
     * @param {string} stage
     * @param {Function} callback
     * @returns {*}
     * The return value of the callback function.
     */
    executeWithTemporaryContext(context, stage, callback) {
        let originalResolutionStage = context.resolutionStage;

        try {
            context.game.pushAbilityContext(context);
            context.resolutionStage = stage;
            return callback();
        } finally {
            context.resolutionStage = originalResolutionStage;
            context.game.popAbilityContext();
        }
    }

    /**
     * Resolves all costs for the ability prior to payment. Some cost objects
     * have a `resolve` method in order to prompt the user to make a choice,
     * such as choosing a card to kneel. Consumers of this method should wait
     * until all costs have a `resolved` value of `true` before proceeding.
     *
     * @returns {Array} An array of cost resolution results.
     */
    resolveCosts(context) {
        return this.cost.map(cost => {
            if(this.options.skipCost && this.options.skipCost(cost)) {
                return { resolved: true, value: true };
            }
            if(cost.resolve) {
                return cost.resolve(context);
            }

            return { resolved: true, value: cost.canPay(context) };
        });
    }

    /**
     * Pays all costs for the ability simultaneously.
     */
    payCosts(context, onlyExpendAction = false) {
        for(let cost of this.cost) {
            if(!this.options.skipCost || !this.options.skipCost(cost) &&
                (!onlyExpendAction || cost.name === 'expendAction')) {
                cost.pay(context);
            }
        }
    }

    /**
     * Return whether when unpay is implemented for the ability cost and the
     * cost can be unpaid.
     *
     * @returns {boolean}
     */
    canUnpayCosts(context) {
        return this.cost.every(cost => cost.unpay && cost.canUnpay(context));
    }

    /**
     * Unpays each cost associated with the ability.
     */
    unpayCosts(context) {
        for(let cost of this.cost) {
            cost.unpay(context);
        }
    }

    /**
     * Returns whether the ability requires a player to be chosen.
     */
    needsChoosePlayer() {
        return !!this.choosePlayerDefinition;
    }

    /**
     * Returns whether there are players that can be chosen, if the ability
     * requires that a player be chosen.
     */
    canResolvePlayer(context) {
        if(!this.needsChoosePlayer()) {
            return true;
        }

        return this.choosePlayerDefinition.canResolve(context);
    }

    /**
     * Prompts the current player to choose a player
     */
    resolvePlayer(context) {
        if(!this.needsChoosePlayer()) {
            return;
        }

        return this.choosePlayerDefinition.resolve(context);
    }

    /**
     * Returns whether there are eligible cards available to fulfill targets.
     *
     * @returns {Boolean}
     */
    canResolveTargets(context) {
        return this.executeWithTemporaryContext(context, 'effect', () => this.targets.every(target => target.canResolve(context)));
    }

    /**
     * Prompts the current player to choose each target defined for the ability.
     *
     * @returns {Array} An array of target resolution objects.
     */
    resolveTargets(context) {
        return flatMap(this.targets, target => target.resolve(context));
    }

    /**
     * Increments the usage of the ability toward its limit, if it has one.
     */
    incrementLimit() {
        if(this.usage) {
            this.usage.increment();
        }
    }

    resetAbilityUsage() {
        this.usage.reset();
    }

    outputMessage(context) {
        this.message.output(context.game, context);
    }

    selectAnotherTarget(player, context, properties) {
        const saveOnSelect = properties.onSelect;
        const updatedOnSelect = (player, card) => {
            // keep the card the same (do not make it as array) even for the event properties ('cards').
            // It should also be used as we got it for the 'saveOnSelect', because logic in onSelect function expects it that way.
            // Reason why we keep cards exactly as it is, is because the redirecting card can use it for the onSelect function
            // which can either take single card or array of cards and by adjusting it here, the info on what is expected in the
            // redirecting onSelect would be lost.
            context.game.raiseEvent('onTargetsChosen', { ability: this, player, cards: card, properties }, event => {
                saveOnSelect(event.player, event.cards);
            });
            return true;
        };
        properties.onSelect = updatedOnSelect;
        if(properties.gameAction) {
            if(!Array.isArray(properties.gameAction)) {
                properties.gameAction = [properties.gameAction];
            }
            properties.gameAction.push('target');
        } else {
            properties.gameAction = ['target'];
        }
        context.game.promptForSelect(player, properties);
    }

    /**
     * Executes the ability once all costs have been paid. Inheriting classes
     * should override this method to implement their behavior; by default it
     * does nothing.
     */
    executeHandler(context) {
        context.game.resolveGameAction(this.gameAction, context).thenExecute(() => {
            if(this.options.callback) {
                this.options.callback(this);
            }
            this.resetOptions();
        });
    }

    cancel(markAsUsed = false) {
        if(markAsUsed) {
            this.incrementLimit();
            this.cancelReason = 'abilityCancel';
        }
        this.cancelled = true;
    }

    isAction() {
        return false;
    }

    isPlayableActionAbility() {
        return false;
    }

    isCardAbility() {
        return this.abilitySourceType === 'card';
    }

    isTriggeredAbility() {
        return false;
    }

    isTraitAbility() {
        return false;
    }

    playTypePlayed() {
    }
}

module.exports = BaseAbility;

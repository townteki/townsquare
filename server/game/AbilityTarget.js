const AbilityTargetMessages = require('./AbilityTargetMessages');
const AbilityChoiceSelection = require('./AbilityChoiceSelection');
const CardSelector = require('./CardSelector');
const Messages = require('./Messages');
const BaseCardSelector = require('./CardSelectors/BaseCardSelector');

/** @typedef {import('./CardMatcher').CardMatcherProps} CardMatcherProps */

/** 
 * @typedef {Object} AbilityTargetProperties 
 * Represents a spell ability provided by card text.
 *
 * Properties:
 * @property {string} activePromptTitle - string that is used in prompt when asking to select the 
 *                target card.
 * @property {Function | string} choosingPlayer - optional function that should return player that
 *                will choose the card.
 * @property {CardMatcherProps} cardCondition - Properties object or function representing the cards that 
 *                can be targeted.
 * @property {string} cardType - type of the card (e.g. `dude`, `goods`, `joker`).
 * @property {string | string[]} gameAction - the game action checked for immunity purposes 
 *                on potential target cards.
 * @property {boolean} ifAble - resolve target only if able (optional target).
 * @property {boolean} autoSelect - in case there is only one possible target, do not ask player to select
 *                the card but select automatically.
 */
class AbilityTarget {
    static create(name, properties) {
        let {message, messages, ...rest} = properties;
        let defaultMessages = ['each', 'eachOpponent'].includes(properties.choosingPlayer) ? Messages.eachPlayerTargeting : null;

        let abilityMessages = new AbilityTargetMessages({
            message,
            messages: messages || defaultMessages
        });

        return new AbilityTarget(name, Object.assign(rest, { messages: abilityMessages }));
    }

    constructor(name, properties) {
        this.type = properties.type || 'choose';
        this.choosingPlayer = properties.choosingPlayer || 'current';
        this.name = name;
        this.properties = properties;
        this.selector = CardSelector.for(properties);
        this.messages = properties.messages;
        this.ifAble = !!properties.ifAble;
        this.autoSelect = properties.autoSelect || properties.autoSelect === false ? properties.autoSelect : false;
        this.activePromptTitle = properties.activePromptTitle;
        this.cardType = properties.cardType || [];
    }

    canResolve(context) {
        const players = this.getChoosingPlayers(context);
        return this.ifAble || players.length > 0 && players.every(choosingPlayer => {
            context.choosingPlayer = choosingPlayer;
            return this.selector.hasEnoughTargets(context);
        });
    }

    resolve(context) {
        let results = this.getChoosingPlayers(context).map(choosingPlayer => {
            context.choosingPlayer = choosingPlayer;
            let eligibleCards = this.selector.getEligibleTargets(context);
            return new AbilityChoiceSelection({
                choosingPlayer: choosingPlayer,
                eligibleChoices: eligibleCards,
                targetingType: this.type,
                name: this.name
            });
        });

        for(let result of results) {
            context.game.queueSimpleStep(() => {
                this.resolveAction(result, context);
            });
        }

        return results;
    }

    getChoosingPlayers(context) {
        if(typeof this.choosingPlayer === 'function') {
            return context.game.getPlayersInFirstPlayerOrder().filter(player => this.choosingPlayer(player));
        }

        if(this.choosingPlayer === 'each') {
            return context.game.getPlayersInFirstPlayerOrder();
        }

        if(this.choosingPlayer === 'eachOpponent') {
            return context.game.getOpponentsInFirstPlayerOrder(context.player);
        }

        if(this.choosingPlayer === 'thisIfLegal') {
            if(!context.player.isCheatin()) {
                return [context.player];
            }
            return [context.player.getOpponent()];
        }

        if(this.choosingPlayer === 'opponent') {
            return [context.player.getOpponent()];
        }

        if(this.choosingPlayer === 'thisIfShootout') {
            if(this.game.shootout) {
                return [context.player];
            }
            return [context.player.getOpponent()];
        }

        return [context.player];
    }

    resolveAction(result, context) {
        context.choosingPlayer = result.choosingPlayer;
        context.currentTargetSelection = result;

        if(BaseCardSelector.isAllowedSpecialTarget(this.cardType)) {
            switch(this.cardType) {
                case 'townsquare':
                    result.resolve(context.game.townsquare.locationCard); 
                    this.messages.outputSelected(context.game, context);
                    return;
                case 'currentHome':
                    result.resolve(context.choosingPlayer.getOutfitCard()); 
                    this.messages.outputSelected(context.game, context);
                    return;
                case 'location':
                    break;
                default:
                    this.messages.outputUnable(context.game, context);
                    result.reject();
                    return;
            }
        }

        let unableToSelect = !this.selector.hasEnoughTargets(context) || this.selector.optional && result.hasNoChoices();
        if(this.ifAble && unableToSelect) {
            this.messages.outputUnable(context.game, context);
            result.reject();
            return;
        }
        let buttons = [];
        if((this.cardType.includes('location') || this.cardType.includes('townsquare')) && 
            this.selector.canTarget(context.game.townsquare.locationCard, context)) {
            buttons = [{ text: 'Town Square' }];
            this.activePromptTitle = this.activePromptTitle || 'Select target location for movement';
        }

        let otherProperties = Object.assign({}, this.properties);
        delete otherProperties.cardCondition;
        delete otherProperties.choosingPlayer;
        delete otherProperties.messages;
        let promptProperties = {
            activePromptTitle: this.activePromptTitle,
            context: context,
            source: context.source,
            selector: this.selector,
            autoSelect: this.autoSelect,
            additionalButtons: buttons,
            onSelect: (player, card) => {
                result.resolve(card);
                if(!card || card.length === 0) {
                    this.messages.outputNoneSelected(context.game, context);
                } else {
                    this.messages.outputSelected(context.game, context);
                }
                return true;
            },
            onCancel: () => {
                if(this.ifAble) {
                    result.reject();
                } else {
                    result.cancel();
                }
                this.messages.outputSkipped(context.game, context);
                return true;
            },
            onMenuCommand: () => {
                result.resolve(context.game.townsquare.locationCard); 
                this.messages.outputSelected(context.game, context);
                return true;               
            }
        };
        context.game.promptForSelect(result.choosingPlayer, Object.assign(promptProperties, otherProperties));
    }
}

module.exports = AbilityTarget;

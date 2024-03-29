const CardMatcher = require('../CardMatcher');
const ParentCost = require('./ParentCost.js');
const SelectCardCost = require('./SelectCardCost.js');
const SelfCost = require('./SelfCost.js');
const SpecificCardCost = require('./SpecificCardCost.js');

class CostBuilder {
    constructor(action, titles = {}) {
        this.action = action;
        this.titles = titles;
    }

    /**
     * Returns a cost that is applied to the card that activated the ability.
     */
    self() {
        return new SelfCost(this.action);
    }

    /**
     * Returns a cost that is applied to the card returned by the cardFunc param.
     * @param {function} cardFunc Function that takes the ability context and return a card.
     */
    specific(cardFunc) {
        return new SpecificCardCost(this.action, cardFunc);
    }

    /**
     * Returns a cost that asks the player to select a card matching the passed condition.
     * @param {function} conditionOrMatcher Either a function that takes a card and ability context and returns whether to allow the player to select it, or a properties hash to be used as a card matcher.
     */
    select(conditionOrMatcher = () => true, cardType, gameAction) {
        const props = {
            activePromptTitle: this.titles.select,
            cardCondition: CardMatcher.createMatcher(conditionOrMatcher),
            gameAction: gameAction
        };
        // cannot pass undefined "cardType" because it would prevent from it being set to default
        if(cardType) {
            props.cardType = cardType;
        }
        return new SelectCardCost(this.action, props);
    }

    /**
     * Returns a cost that asks the player to select an exact number of cards matching the passed condition.
     * @param {number} number The number of cards that must be selected.
     * @param {function} conditionOrMatcher Either a function that takes a card and ability context and returns whether to allow the player to select it, or a properties hash to be used as a card matcher.
     */
    selectMultiple(number, conditionOrMatcher = () => true) {
        return new SelectCardCost(this.action, {
            mode: 'exactly',
            numCards: number,
            activePromptTitle: this.titles.selectMultiple(number),
            cardCondition: CardMatcher.createMatcher(conditionOrMatcher)
        });
    }

    /**
     * Returns a cost that asks the player to select any number of cards matching the passed condition.
     * @param {function} condition Function that takes a card and ability context and returns whether to allow the player to select it.
     * @param {boolean} zeroAllowed Boolean denoting whether 0 is a valid amount of the cost to be paid.
     */
    selectAny(condition = () => true, zeroAllowed = true) {
        return new SelectCardCost(this.action, {
            mode: 'unlimited',
            optional: zeroAllowed,
            activePromptTitle: this.titles.selectAny,
            cardCondition: condition
        });
    }

    /**
     * Returns a cost that is applied to the parent card that the activating card is attached to.
     */
    parent() {
        return new ParentCost(this.action);
    }
}

module.exports = CostBuilder;

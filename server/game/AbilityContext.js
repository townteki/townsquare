const ResolvedTargets = require('./gamesteps/ResolvedTargets.js');

/** @typedef {import('./baseability')} BaseAbility */
/** @typedef {import('./basecard')} BaseCard */
/** @typedef {import('./game')} Game */
/** @typedef {import('./player')} Player */

class AbilityContext {
    constructor(properties) {
        /** @type {BaseAbility} */
        this.ability = properties.ability;
        /** @type {Game} */
        this.game = properties.game;
        /** @type {BaseCard} */
        this.source = properties.source;
        /** @type {Player} */
        this.player = properties.player;
        this.costs = {};
        this.costValues = {};
        this.targets = new ResolvedTargets();
        this.resolutionStage = 'effect';
        this.cardToUpgrade = properties.cardToUpgrade;
        this.comboNumber = properties.comboNumber;
    }

    addCost(name, value) {
        if(!this.costValues[name]) {
            this.costValues[name] = [];
        }

        let valueAsArray = Array.isArray(value) ? value : [value];
        this.costValues[name] = this.costValues[name].concat(valueAsArray);
        this.costs[name] = value;
    }

    getCostValuesFor(name) {
        return this.costValues[name] || [];
    }

    saveCostCardsInfo(cards) {
        this.costs.savedCardsInfo = [];
        cards.forEach(card => {
            const cardInfo = {
                card,
                booted: card.booted,
                parent: card.parent
            };
            this.costs.savedCardsInfo.push(cardInfo);
        });        
    }
}

module.exports = AbilityContext;

const PlayingTypes = require('./Constants/PlayingTypes');

class BaseCostReducer {
    constructor(game, source, properties) {
        this.game = game;
        this.source = source;
        this.playingTypes = this.buildPlayingTypes(properties);
        this.amount = properties.amount === null || properties.amount === undefined ? 1 : properties.amount;
        this.minimum = properties.minimum;
        this.isIncrease = false;
    }

    buildPlayingTypes(properties) {
        if(!properties.playingTypes || properties.playingTypes === PlayingTypes.Any) {
            return PlayingTypes.Any;
        }
        let playingTypes = Array.isArray(properties.playingTypes) ? properties.playingTypes : [properties.playingTypes];
        return playingTypes;
    }

    canReduce() {
    }

    getAmount(card) {
        let currentAmount = (this.isIncrease ? -1 : 1) * this.amount;
        if(typeof(this.amount) === 'function') {
            currentAmount = ((this.isIncrease ? -1 : 1) * this.amount(card)) || 0;
        }

        if(!this.minimum || (card.cost - currentAmount >= this.minimum)) {
            return currentAmount;
        }
        return card.cost - this.minimum < 0 ? 0 : card.cost - this.minimum;
    }

    markUsed() {
    }

    markUnused() {
    }

    isExpired() {
    }

    registerEvents() {
    }

    unregisterEvents() {
    }
}

module.exports = BaseCostReducer;

const AbilityUsage = require('./abilityusage');

class CostReducer {
    constructor(game, source, properties) {
        this.game = game;
        this.source = source;
        this.uses = 0;
        this.usage = new AbilityUsage({ limit: properties.limit || 0, repeatable: true });
        this.match = properties.match || (() => true);
        this.amount = properties.amount === null || properties.amount === undefined ? 1 : properties.amount;
        this.isIncrease = properties.isIncrease;
        this.playingTypes = this.buildPlayingTypes(properties);
        if(this.usage) {
            this.usage.registerEvents(game);
        }
    }

    buildPlayingTypes(properties) {
        if(!properties.playingTypes) {
            return ['any'];
        }
        let playingTypes = Array.isArray(properties.playingTypes) ? properties.playingTypes : [properties.playingTypes];
        return playingTypes;
    }

    canReduce(playingType, card) {
        if(this.usage && this.usage.isUsed()) {
            return false;
        }

        return (this.playingTypes.includes(playingType) || this.playingTypes.includes('any')) && !!this.match(card);
    }

    getAmount(card) {
        if(typeof(this.amount) === 'function') {
            return ((this.isIncrease ? -1 : 1) * this.amount(card)) || 0;
        }

        return (this.isIncrease ? -1 : 1) * this.amount;
    }

    markUsed() {
        if(this.usage) {
            this.usage.increment();
        }
    }

    isExpired() {
        return !!this.usage && this.usage.isUsed() && !this.usage.isRepeatable();
    }

    unregisterEvents() {
        if(this.usage) {
            this.usage.unregisterEvents(this.game);
        }
    }
}

module.exports = CostReducer;

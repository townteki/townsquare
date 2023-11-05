const AbilityUsage = require('./abilityusage');
const BaseCostReducer = require('./basecostreducer');
const PlayingTypes = require('./Constants/PlayingTypes');

class CostReducer extends BaseCostReducer {
    constructor(game, source, properties) {
        super(game, source, properties);
        this.uses = 0;
        this.usage = new AbilityUsage({ limit: properties.limit || 0, repeatable: true });
        this.match = properties.match || (() => true);
        this.isIncrease = properties.isIncrease;
        this.registerEvents();
    }

    canReduce(playingType, card, context) {
        if(this.usage && this.usage.isUsed()) {
            return false;
        }

        return (this.playingTypes.includes(playingType) || this.playingTypes.includes(PlayingTypes.Any)) && !!this.match(card, context);
    }

    markUsed() {
        if(this.usage) {
            this.usage.increment();
        }
    }

    markUnused() {
        if(this.usage) {
            this.usage.decrement();
        }        
    }

    isExpired() {
        return !!this.usage && this.usage.isUsed() && !this.usage.isRepeatable();
    }

    registerEvents() {
        if(this.usage) {
            this.usage.registerEvents(this.game);
        }
    }

    unregisterEvents() {
        if(this.usage) {
            this.usage.unregisterEvents(this.game);
        }
    }
}

module.exports = CostReducer;

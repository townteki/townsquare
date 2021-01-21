const AbilityUsage = require("./abilityusage");

class CostReducer {
    constructor(game, source, properties) {
        this.game = game;
        this.source = source;
        this.uses = 0;
        this.usage = new AbilityUsage({ limit: properties.limit || 0, repeatable: true });
        this.match = properties.match || (() => true);
        this.amount = properties.amount || 1;
        this.playingTypes = this.buildPlayingTypes(properties);
        if(this.usage) {
            this.usage.registerEvents(game);
        }
    }

    buildPlayingTypes(properties) {
        let playingTypes = Array.isArray(properties.playingTypes) ? properties.playingTypes : [properties.playingTypes];

        // Reducers that reduce marshalling any card with no characteristic
        // requirements should also reduce marshalling any card into shadows.
        // See the following ruling on Hizdahr zo Loraq:
        // http://www.cardgamedb.com/forums/index.php?/topic/39948-ruling-hizdahr-zo-loraq/
        if(!properties.match && playingTypes.includes('marshal')) {
            return playingTypes.concat('marshalIntoShadows');
        }

        return playingTypes;
    }

    canReduce(playingType, card) {
        if(this.usage && this.usage.isUsed()) {
            return false;
        }

        if(playingType === 'play' && this.playingTypes.includes('outOfShadows') && card.location === 'shadows') {
            return !!this.match(card);
        }

        return this.playingTypes.includes(playingType) && !!this.match(card);
    }

    getAmount(card) {
        if(typeof(this.amount) === 'function') {
            return this.amount(card) || 0;
        }

        return this.amount;
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

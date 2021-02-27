class SingleCostReducer {
    constructor(game, player, source, properties) {
        this.game = game;
        this.source = source;
        this.player = player;
        this.card = properties.card;
        this.amount = properties.amount || 1;
        this.used = false;
        this.playingTypes = this.buildPlayingTypes(properties);
    }

    buildPlayingTypes(properties) {
        if(!properties.playingTypes || properties.playingTypes === 'any') {
            return 'any';
        }
        let playingTypes = Array.isArray(properties.playingTypes) ? properties.playingTypes : [properties.playingTypes];
        return playingTypes;
    }

    canReduce(playingType, card) {
        return (this.playingTypes === 'any' || this.playingTypes.includes(playingType)) && card === this.card;
    }

    getAmount(card) {
        if(typeof(this.amount) === 'function') {
            return this.amount(card) || 0;
        }

        return this.amount;
    }

    markUsed() {
        this.player.removeCostReducer(this);
        this.used = true;
    }

    isExpired() {
        return this.used;
    }

    unregisterEvents() {
    }
}

module.exports = SingleCostReducer;

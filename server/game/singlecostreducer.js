const BaseCostReducer = require('./basecostreducer');

class SingleCostReducer extends BaseCostReducer {
    constructor(game, player, source, properties) {
        super(game, source, properties);
        this.player = player;
        this.card = properties.card;
        this.amount = properties.amount || 1;
        this.used = false;
    }

    canReduce(playingType, card) {
        return (this.playingTypes === 'any' || this.playingTypes.includes(playingType)) && card === this.card;
    }

    markUsed() {
        this.player.removeCostReducer(this);
        this.used = true;
    }

    markUnused() {
        this.player.addCostReducer(this);
        this.used = false;   
    }

    isExpired() {
        return this.used;
    }

    registerEvents() {
    }

    unregisterEvents() {
    }
}

module.exports = SingleCostReducer;

const BaseAbility = require('./baseability.js');

const ActionPlayTypes = ['any', 'noon', 'shootout', 'shootout:join', 'resolution', 'cheatin resolution'];

class PlayTypeAbility extends BaseAbility {
    constructor(properties) {
        super(properties);
        this.playType = this.buildPlayType(properties);
    }

    buildPlayType(properties) {
        if(!properties.playType) {
            return 'any';
        }
        let result = properties.playType;
        if(!Array.isArray(properties.playType)) {
            result = [properties.playType];
        }
        let errorType = result.find(type => !ActionPlayTypes.includes(type));
        if(errorType) {
            throw new Error(`'${errorType}' is not a valid 'playType' property`);
        }

        return result;
    }

    playTypePlayed() {
        if(this.playType.includes('noon') && this.game.getCurrentPlayWindowName() === 'high noon') {
            return 'noon';
        } 
        if(this.playType.includes('shootout') && this.game.getCurrentPlayWindowName() === 'shootout plays') {
            return 'shootout';
        } 
        if(this.playType.includes('resolution') && this.game.getCurrentPlayWindowName() === 'shootout resolution') {
            return 'resolution';
        } 
        if(this.playType.includes('cheatin resolution') && 
            (this.game.getCurrentPlayWindowName() === 'shootout resolution' || this.game.getCurrentPlayWindowName() === 'gambling')) {
            return 'cheatin resolution';
        } 
    }
}

module.exports = PlayTypeAbility;

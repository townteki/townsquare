const AbilityContext = require('./AbilityContext.js');
const BaseAbility = require('./baseability.js');

const ActionPlayTypes = ['any', 'noon', 'shootout', 'shootout:join', 'resolution', 'cheatin resolution'];
const AllowedTypesForPhase = {
    'high noon': ['noon'],
    'shootout plays': ['shootout', 'shootout:join'],
    'shootout resolution': ['resolution', 'cheatin resolution'],
    'gambling': ['cheatin resolution']
};

class PlayTypeAbility extends BaseAbility {
    constructor(game, card, properties) {
        super(properties);
        this.game = game;
        this.card = card;
        this.triggeringPlayer = properties.triggeringPlayer || 'controller';
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
        if(this.playType.includes('shootout:join') && this.game.getCurrentPlayWindowName() === 'shootout plays') {
            return 'shootout:join';
        }																												  
        if(this.playType.includes('resolution') && this.game.getCurrentPlayWindowName() === 'shootout resolution') {
            return 'resolution';
        } 
        if(this.playType.includes('cheatin resolution') && 
            (this.game.getCurrentPlayWindowName() === 'shootout resolution' || this.game.getCurrentPlayWindowName() === 'gambling')) {
            return 'cheatin resolution';
        } 
    }

    allowPlayer(player) {
        return player.isAllowed(this.card, this.triggeringPlayer);
    }

    meetsRequirements(context) {
        if(!super.meetsRequirements(context)) {
            return false;
        }

        if(!this.allowPlayer(context.player)) {
            return false;
        }

        if(this.playType !== 'any' && this.game.currentPlayWindow) {
            let allowedTypes = AllowedTypesForPhase[this.game.getCurrentPlayWindowName()];
            if(!allowedTypes) {
                return false;
            }
            if(!this.playType.some(type => AllowedTypesForPhase[this.game.getCurrentPlayWindowName()].includes(type))) {
                return false;
            }
        }
        
        return true;
    }

    createContext(player) {
        return new AbilityContext({
            ability: this,
            game: this.game,
            player: player,
            source: this.card
        });
    }
}

module.exports = PlayTypeAbility;

const BaseAbility = require('../baseability');
const PlayingTypes = require('../Constants/PlayingTypes');
const Costs = require('../costs');
const GameActions = require('../GameActions');
const SingleCostReducer = require('../singlecostreducer');

class PutIntoPlayCardAction extends BaseAbility {
    constructor(properties = { playingType: PlayingTypes.Ability, abilitySourceType: 'card', targetLocationUuid: '' }, callback) {
        super({
            abilitySourceType: properties.abilitySourceType,
            cost: [
                Costs.payReduceableGRCost(properties.playingType)
            ],
            target: properties.targetProperties
        });
        this.properties = properties;
        this.playingType = properties.playingType;
        this.reduceAmount = properties.reduceAmount;
        this.callback = callback;
    }

    isAction() {
        return false;
    }

    meetsRequirements(context) {
        if(!super.meetsRequirements(context)) {
            return false;
        }
        var { player, source } = context;

        return (
            source.getType() !== 'action' &&
            player.isCardInPlayableLocation(source, this.playingType) &&
            player.canPutIntoPlay(source, { playingType: this.playingType, context })
        );
    }

    resolveCosts(context) {
        var { game, player, source } = context;
        if(this.reduceAmount) {
            this.costReducer = new SingleCostReducer(game, player, null, { 
                card: source, 
                amount: this.reduceAmount, 
                minimum: this.properties.minimum,
                playingTypes: PlayingTypes.Any
            });
            player.addCostReducer(this.costReducer);
        }
        context.targetParent = this.properties.targetParent;
        let resolvedCosts = super.resolveCosts(context);
        if(resolvedCosts.some(resolvedCost => !resolvedCost.value)) {
            player.removeCostReducer(this.costReducer);
        }
        return resolvedCosts;
    }

    executeHandler(context) {
        var { game, player, source } = context;
        game.resolveGameAction(GameActions.putIntoPlay({                        
            player: player,
            card: source, 
            params: Object.assign(this.properties, { context: context })
        })).thenExecute(event => {
            if(this.costReducer) { 
                event.player.removeCostReducer(this.costReducer);     
            }
        }).thenExecute(event => {
            if(this.callback) {
                this.callback(event);
            }
        });
    }

    playTypePlayed() {
        return this.playingType;
    }
}

module.exports = PutIntoPlayCardAction;

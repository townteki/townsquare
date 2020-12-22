const BaseAbility = require('../baseability');
const Costs = require('../costs');

class ShoppinCardAction extends BaseAbility {
    constructor(target = '') {
        super({
            abilitySourceType: 'game',
            cost: [
                Costs.payReduceableGRCost('shoppin')
            ]
        });
        this.target = target;
        this.title = 'Play';
    }

    isAction() {
        return true;
    }

    meetsRequirements(context) {
        var { game, player, source } = context;

        return (
            game.currentPhase === 'high noon' &&
            source.getType() !== 'action' &&
            source.location === 'hand' &&
            player.canPutIntoPlay(source, 'shoppin')
        );
    }

    executeHandler(context) {
        let params = {
            card: context.source,
            originalController: context.source.controller,
            originalLocation: context.source.location,
            player: context.player,
            type: 'card'
        };
        context.game.raiseEvent('onCardPlayedAsShoppin', params, () => {
            context.player.putIntoPlay(context.source, 'shoppin', {}, this.target);
            context.game.addMessage('{0} does Shoppin\' to bring into play {1} costing {2} GR', context.player, context.source, context.costs.ghostrock);
        });
    }

}

module.exports = ShoppinCardAction;

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
            player.isCardInPlayableLocation(source, 'shoppin') &&
            player.canPutIntoPlay(source, 'shoppin')
        );
    }

    executeHandler(context) {
        let params = {
            context: context,
            target: this.target,
            playingType: 'shoppin'
        };
        context.game.raiseEvent('onCardEntersPlay', params, event => {
            event.context.player.putIntoPlay(event.context.source, { playingType: event.playingType, target: event.target, context: context });          
        });
    }

}

module.exports = ShoppinCardAction;

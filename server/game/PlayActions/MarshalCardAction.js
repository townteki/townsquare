const BaseAbility = require('../baseability');
const Costs = require('../costs');

class MarshalCardAction extends BaseAbility {
    constructor() {
        super({
            abilitySourceType: 'game',
            cost: [
                Costs.payReduceableGoldCost('marshal'),
                Costs.playLimited()
            ]
        });
        this.title = 'Marshal';
    }

    isAction() {
        return true;
    }

    meetsRequirements(context) {
        var { game, player, source } = context;

        return (
            game.currentPhase === 'marshal' &&
            source.getType() !== 'event' &&
            player.allowMarshal &&
            player.isCardInPlayableLocation(source, 'marshal') &&
            !player.canDuplicate(source) &&
            player.canPutIntoPlay(source, 'marshal')
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
        context.game.raiseEvent('onCardMarshalled', params, () => {
            context.game.addMessage(this.getMessageFormat(params), context.player, context.source, params.originalController, params.originalLocation, context.costs.gold);
            context.player.putIntoPlay(context.source, 'marshal');
        });
    }

    getMessageFormat(params) {
        const messages = {
            'card.hand.current': '{0} marshals {1} costing {4} gold',
            'card.other.current': '{0} marshals {1} from their {3} costing {4} gold',
            'card.other.opponent': '{0} marshals {1} from {2}\'s {3} costing {4} gold'
        };
        let hand = params.originalLocation === 'hand' ? 'hand' : 'other';
        let current = params.originalController === params.player ? 'current' : 'opponent';
        return messages[`card.${hand}.${current}`] || messages['card.hand.current'];
    }
}

module.exports = MarshalCardAction;

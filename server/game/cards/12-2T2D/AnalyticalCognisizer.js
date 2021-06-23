const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class AnalyticalCognisizer extends GoodsCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onGadgetInvented: event => event.gadget === this
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.event.scientist }), context);
                context.player.drawCardsToHand(1, context);
            }
        });
        this.reaction({
            title: 'Analytical Cognisizer',
            triggerBefore: true,
            when: {
                onCardPulled: event => event.props.pullingDude && event.props.source &&
                    event.props.source.hasKeyword('gadget') &&
                    event.props.pullingDude.isNearby(this.gamelocation)
            },
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardFromHand((card, context) => 
                    card.getType() === 'goods' &&
                    context.event.props.source !== card)
            ],
            message: context => 
                this.game.addMessage('{0} uses {1} and discards {2} from hand to change pull suit to Hearts', 
                    context.player, this, context.costs.discardFromHand),
            handler: context => {
                const savedEventHandler = context.event.handler;
                context.replaceHandler(event => {
                    if(event.suit) {
                        event.suit = 'Hearts';
                    }
                    savedEventHandler(event);
                });
            }
        });
    }
}

AnalyticalCognisizer.code = '20040';

module.exports = AnalyticalCognisizer;

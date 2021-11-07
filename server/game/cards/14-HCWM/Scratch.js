const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Scratch extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onCardDiscarded: event => event.card === this && event.originalLocation === 'play area'
            },
            location: 'discard pile',
            handler: context => {
                context.player.redrawFromHand(1, (event, discarded) => 
                    this.game.addMessage('{0} discards {1} and draws a card thanks to {3}', context.player, discarded, this), 
                {
                    title: this.title
                }, context);
            }
        });

        this.action({
            title: 'Noon/Shootout: Scratch',
            playType: ['noon', 'shootout:join'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose where to attach Scratch',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: (card, context) => 
                        card.locationCard.isAdjacent(this.gamelocation) &&
                        context.player.canAttach(this, card, 'ability')
                },
                cardType: ['dude']
            },
            handler: context => {
                context.player.attach(this, context.target, 'ability', () => 
                    this.game.addMessage('{0} uses {1} to attach it to {2}', context.player, this, context.target));
            }
        });
    }
}

Scratch.code = '22042';

module.exports = Scratch;

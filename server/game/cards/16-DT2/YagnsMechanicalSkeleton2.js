const GoodsCard = require('../../goodscard.js');

class YagnsMechanicalSkeleton2 extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.addKeyword('Gadget')
        });

        this.reaction({
            title: 'React: Yagn\'s Mechanical Skeleton',
            triggerBefore: true,
            when: {
                onDudeMoved: event => this.matchesReactCondition(event.card, event.options.context),
                onCardBooted: event => this.matchesReactCondition(event.card, event.context),
                onDudeSentHome: event => this.matchesReactCondition(event.card, event.context)
            },
            cost: ability.costs.bootSelf(),
            handler: context => {
                context.replaceHandler(event => {
                    let eventText = 'send home';
                    if(['onDudeMoved', 'onCardBooted'].includes(event.name)) {
                        eventText = event.name === 'onDudeMoved' ? 'move' : 'boot';
                    }
                    this.game.addMessage('{0} uses {1} to cancel {2} action on {3}', 
                        context.player, this, eventText, this.parent);
                });
            }
        });
    }

    matchesReactCondition(card, context) {
        return this.parent && card === this.parent && context &&
            context.player && context.player !== this.controller;
    }
}

YagnsMechanicalSkeleton2.code = '24175';

module.exports = YagnsMechanicalSkeleton2;

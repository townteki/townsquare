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
                onDudeMoved: event => this.parent && event.card === this.parent &&
                    event.options.context && event.options.context.player !== this.controller,
                onCardBooted: event => this.parent && event.card === this.parent &&
                    event.context && event.context.player !== this.controller,
                onDudeSentHome: event => this.parent && event.card === this.parent &&
                    event.context && event.context.player !== this.controller
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
}

YagnsMechanicalSkeleton2.code = '24175';

module.exports = YagnsMechanicalSkeleton2;

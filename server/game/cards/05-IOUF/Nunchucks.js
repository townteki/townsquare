const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Nunchucks extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.attachmentRestriction({ keyword: 'kung fu' });

        this.whileAttached({
            condition: () => this.isParticipating(),
            effect: ability.effects.modifySkillRating('kung fu', 1)
        });

        this.reaction({
            title: 'React: Nunchucks',
            triggerBefore: true,
            when: {
                onCardPulled: () => true
            },
            condition: () => this.isParticipating(),
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to reduce {2}\'s pull by {3}', 
                    context.player, this, context.event.pullingDude, this.parent.getSkillRating('kung fu')),
            handler: context => {
                const saveEventHandler = context.event.handler;
                context.replaceHandler(event => {
                    if(event.value) {
                        event.value -= this.parent.getSkillRating('kung fu');
                    } else {
                        event.value = -1 * this.parent.getSkillRating('kung fu');
                    }
                    saveEventHandler(event);
                });                
            }
        });
    }
}

Nunchucks.code = '09029';

module.exports = Nunchucks;

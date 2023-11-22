const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class EssenceOfArmitage extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.attachmentRestriction({ keyword: 'abomination' });

        this.persistentEffect({
            targetController: 'any',
            condition: () => this.parent && this.parent.isParticipating(),
            match: card => card.getType() === 'dude' && card.isParticipating() && !card.hasKeyword('abomination'),
            effect: ability.effects.modifyBullets(-1)
        });

        this.reaction({
            title: 'React: Essence of Armitage',
            when: {
                onDudeSentHome: event => this.isParticipating() && 
                    event.card.controller !== this.controller && event.params.options.reason === 'fleeing'
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to give {2} +1 permanent CP', context.player, this, this.parent),
            handler: () => {
                this.parent.modifyControl(1);
            }
        });
    }
}

EssenceOfArmitage.code = '15014';

module.exports = EssenceOfArmitage;

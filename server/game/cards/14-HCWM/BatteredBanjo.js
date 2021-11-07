const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BatteredBanjo extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Battered Banjo',
            triggerBefore: true,
            when: {
                onPullSuccess: event => event.source && event.source.hasKeyword('hymn') &&
                    event.source.gamelocation === this.gamelocation
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to give {2} +1 influence', context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: ability.effects.modifyInfluence(1)
                }));
            }
        });

        this.action({
            title: 'Noon: Battered Banjo',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardSelf()
            ],
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.gamelocation === this.gamelocation 
                },
                cardType: ['dude'],
                gameAction: 'decreaseBullets'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to give {2} -2 bullets', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(-2)
                }));
            }
        });
    }
}

BatteredBanjo.code = '22043';

module.exports = BatteredBanjo;

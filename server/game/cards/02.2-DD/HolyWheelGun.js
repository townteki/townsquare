const GoodsCard = require('../../goodscard.js');

class HolyWheelGun extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Holy Wheel Gun',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            message: context => {
                let text = '{0} uses {1} to give {2} -1 bullets';
                if(context.target.hasKeyword('abomination')) {
                    text += ' and they have to be selected as first casualty';
                } 
                this.game.addMessage(text, context.player, this, context.target);
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(-1)
                }));
                if(context.target.hasKeyword('abomination')) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: context.target,
                        effect: ability.effects.selectAsFirstCasualty(this)
                    }));
                }
            }
        });
    }
}

HolyWheelGun.code = '03015';

module.exports = HolyWheelGun;

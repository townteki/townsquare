const GoodsCard = require('../../goodscard.js');

class ElectrostaticPumpGun extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Electrostatic Pump Gun',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose an opposing dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participting: true 
                },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to give {2} -1 bullets', context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyBullets(-1)
                }));
                context.player.pull((pulledCard, pulledValue, pulledSuit) => {
                    if('clubs' !== pulledSuit.toLowerCase() && context.target.bullets === 0) {
                        this.applyAbilityEffect(context.ability, ability => ({
                            match: context.target,
                            effect: ability.effects.setAsDraw()
                        }));
                        this.game.addMessage('{0} uses {1} to set {2} as draw', context.player, this);
                    }                  
                }, true);
            }
        });
    }
}

ElectrostaticPumpGun.code = '20038';

module.exports = ElectrostaticPumpGun;

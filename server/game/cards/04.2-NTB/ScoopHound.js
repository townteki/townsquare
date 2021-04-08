const GoodsCard = require('../../goodscard.js');

class ScoopHound extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Scoop Hound',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent shootout plays to bring dudes into either posse or send dudes home booted',
                    context.player, this),
            handler: context => {
                this.game.shootout.actOnAllParticipants(dude => {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: dude,
                        effect: ability.effects.cannotBeSentHomeByShootout()
                    }));
                });
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.game.shootout,
                    effect: [
                        ability.effects.cannotBringDudesIntoPosseByShootout()
                    ]
                }));
            }
        });
    }
}

ScoopHound.code = '07014';

module.exports = ScoopHound;

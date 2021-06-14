const DudeCard = require('../../dudecard.js');

class XuiYinChen extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Raise posse influence and make them studs',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            message: context =>
                this.game.addMessage('{0} uses {1}\'s ability on their posse to give them +1 influence and make them studs', context.player, this),
            handler: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.game.shootout.getPosseByPlayer(context.player).getDudes(),
                    effect: [
                        ability.effects.modifyInfluence(1),
                        ability.effects.setAsStud()
                    ]
                }));
            }
        });
    }
}

XuiYinChen.code = '09009';

module.exports = XuiYinChen;

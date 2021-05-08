const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class PersonalOrnithopter extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Repeat Shootout: Join Posse',
            playType: 'shootout:join',
            cost: ability.costs.payGhostRock(1),
            condition: () => this.game.shootout && !this.parent.isParticipating(),
            actionContext: { card: this.parent, gameAction: 'joinPosse'},
            repeatable: true,
            message: context =>
                this.game.addMessage('{0} uses {1} to have {2} soar into their posse', context.player, this, this.parent),
            handler: () => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: this.parent }));
            }
        });

        this.action({
            title: 'Shootout: Flee',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            actionContext: { card: this.parent, gameAction: 'sendHome'},
            message: context => this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, this.parent),
            handler: context => {
                this.game.shootout.sendHome(this.parent, context);
            }
        });
    }
}

PersonalOrnithopter.code = '11019';

module.exports = PersonalOrnithopter;

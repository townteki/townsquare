const GoodsCard = require('../../goodscard.js');
const GameActions = require('../../GameActions/index.js');

class TheGamblersGun extends GoodsCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onCardAbilityResolved: event => event.context.player !== this.controller &&
                    event.ability.isCardAbility() && event.ability.playTypePlayed() === 'cheatin resolution' &&
                    this.parent && this.parent.getType() === 'dude'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.discardCard({ card: this.parent }), context).thenExecute(() => {
                    this.game.addMessage('{0} discards {1} due to {2} because a Cheatin\' Resolution was used against them', 
                        context.player, this.parent, this);
                });
            }
        });

        this.action({
            title: 'The Gambler\'s Gun',
            playType: ['resolution'],
            cost: ability.costs.bootSelf(),
            ifCondition: context => this.parent && this.game.shootout &&
                this.parent === this.game.shootout.getPosseByPlayer(context.player).shooter,
            ifFailMessage: context => this.game.addMessage('{0} uses {1}, but it has no effect because {2} is not the shooter',
                context.player, this, this.parent),
            handler: context => {
                if(context.player.modifyRank(2, context)) {
                    this.game.addMessage('{0} uses {1}\'s {2} to increase their hand rank by 2; Current hand rank is {3}', 
                        context.player, this.parent, this, context.player.getTotalRank());
                }
            }
        });
    }
}

TheGamblersGun.code = '17015';

module.exports = TheGamblersGun;

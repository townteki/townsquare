const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FeatheredFriend extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Feathered Friend',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            ifCondition: () => 
                this.game.getDudesAtLocation(this.gamelocation, dude => dude.controller !== this.controller).length,
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but there is no opponent\'s dude at that location', context.player, this),
            handler: context => {
                this.handleFeatheredAbility(context);
            }
        });

        this.action({
            title: 'Shootout: Feathered Friend',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            handler: context => {
                this.handleFeatheredAbility(context);
            }
        });
    }

    handleFeatheredAbility(context) {
        if(context.player.getOpponent().hand.length) {
            this.game.resolveGameAction(GameActions.lookAtHand({ 
                player: context.player, 
                opponent: context.player.getOpponent(),
                title: `Look at ${context.player.getOpponent().name}'s card in hand`,
                numToShow: 1,
                context
            }), context);
            this.game.addMessage('{0} uses {1} to look at random card in {2}\'s hand', 
                context.player, this, context.player.getOpponent());
        } else {
            this.game.addMessage('{0} uses {1}, but there is no card in {2}\'s hand to look at', 
                context.player, this, context.player.getOpponent());
        }        
    }
}

FeatheredFriend.code = '23037';

module.exports = FeatheredFriend;

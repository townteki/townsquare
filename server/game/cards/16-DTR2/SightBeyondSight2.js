const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class SightBeyondSight2 extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Look at 1 card',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: context => {
                this.game.resolveGameAction(GameActions.lookAtHand({ 
                    player: context.player, 
                    opponent: context.player.getOpponent(),
                    title: `Look at ${context.player.getOpponent().name}'s hand`,
                    numToShow: 1,
                    message: context =>
                        this.game.addMessage('{0} uses {1} to look at 1 card in opponent\' hand', context.player, this),
                    context
                }), context);
            }
        });

        this.spellAction({
            title: 'Look at 2 cards',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            difficulty: 9,
            onSuccess: context => {
                this.game.resolveGameAction(GameActions.lookAtHand({ 
                    player: context.player, 
                    opponent: context.player.getOpponent(),
                    title: `Look at ${context.player.getOpponent().name}'s hand`,
                    numToShow: 2,
                    message: context =>
                        this.game.addMessage('{0} uses {1} to look at 2 cards in opponent\' hand', context.player, this),
                    context
                }), context);
            }
        });

        this.spellAction({
            title: 'Look at 3 cards',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            difficulty: 12,
            onSuccess: context => {
                this.game.resolveGameAction(GameActions.lookAtHand({ 
                    player: context.player, 
                    opponent: context.player.getOpponent(),
                    title: `Look at ${context.player.getOpponent().name}'s hand`,
                    numToShow: 3,
                    message: context =>
                        this.game.addMessage('{0} uses {1} to look at 3 cards in opponent\' hand', context.player, this),
                    context
                }), context);
            }
        });
    }
}

SightBeyondSight2.code = '25255';

module.exports = SightBeyondSight2;

const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class JaelsGuile extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Jael\'s Guile',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            handler: context => {
                const jaelsGuileFunc = (player, context) => {
                    this.game.queueSimpleStep(() => { 
                        this.useJaelsGuile(player.getOpponent(), context, 'first');
                    });
                    this.game.queueSimpleStep(() => { 
                        this.useJaelsGuile(player.getOpponent(), context, 'second');
                    });  
                };
                if(context.player.isCheatin()) {
                    if(this.parent.booted) {
                        this.game.addMessage('{0} uses {1} but it does not have any effect because he is cheatin\' and {2} is booted',
                            context.player, this, this.parent);
                        return;
                    }
                    this.game.resolveGameAction(GameActions.bootCard({ card: this.parent }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} and boots {2} to have {3} choose dudes to be booted or discarded',
                            context.player, this, this.parent, context.player.getOpponent());
                        jaelsGuileFunc(context.player, context);
                    });
                } else {
                    this.game.addMessage('{0} uses {1} to have {2} choose dudes to be booted or discarded',
                        context.player, this, context.player.getOpponent());
                    jaelsGuileFunc(context.player, context);
                }
            }
        });
    }

    useJaelsGuile(player, context, order) {
        const dudesInPosse = this.game.shootout.getPosseByPlayer(player).getDudes();
        const wantedDudes = dudesInPosse.filter(dude => dude.isWanted());
        let dudesForSelection = wantedDudes.length > 0 ? wantedDudes : dudesInPosse;
        this.game.promptForSelect(player, {
            activePromptTitle: `Select ${order} dude to boot or discard`,
            waitingPromptTitle: 'Waiting for opponent to select dude',
            cardCondition: card => dudesForSelection.includes(card),
            cardType: 'dude',
            onSelect: (player, card) => {
                if(card.booted) {
                    this.game.resolveGameAction(GameActions.discardCard({ card }), context);
                    this.game.addMessage('{0} discards {1} as a result of {2}', player, card, this);
                } else {
                    this.game.resolveGameAction(GameActions.bootCard({ card }), context);
                    this.game.addMessage('{0} boots {1} as a result of {2}', player, card, this);
                }
                return true;
            },
            source: this
        });
    }
}

JaelsGuile.code = '11018';

module.exports = JaelsGuile;

const ActionCard = require('../../actioncard.js');
const PhaseNames = require('../../Constants/PhaseNames.js');
const GameActions = require('../../GameActions/index.js');
const NullCard = require('../../nullcard.js');

class LikeABull extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Cheatin\': Like a Bull...',
            playType: ['cheatin resolution'],
            handler: context => {
                if(context.player.getSpendableGhostRock() > 0 || context.player.hand.length > 0) {
                    this.game.promptWithMenu(context.player.getOpponent(), this, {
                        activePrompt: {
                            menuTitle: 'Choose one',
                            buttons: [
                                { text: 'Pay 1 Ghost Rock', method: 'payGR', disabled: context.player.getSpendableGhostRock() <= 0 },
                                { text: 'Discard random card', method: 'discardCard', disabled: context.player.hand.length === 0 }
                            ],
                            promptTitle: this.title
                        },
                        source: this
                    });   
                } else {
                    this.game.addMessage('{0} uses {1}, but {2} is completely broke and cannot pay nor discard a card', 
                        context.player, this, context.player.getOpponent());
                }    
                if(this.game.shootout) {
                    this.game.resolveGameAction(GameActions.decreaseCasualties({ player: context.player, amount: 1 }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to decrease their casualties by 1', context.player, this);                        
                    });
                }
            }
        });

        this.action({
            title: 'Resolution: Like a Bull...',
            playType: ['resolution'],
            ifCondition: () => this.game.shootout && this.game.shootout.shootoutLocation.isDeed(),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but it fails because shootout does not take place at a deed', context.player, this),
            handler: context => {
                const deedCard = this.game.shootout ? this.game.shootout.shootoutLocation.locationCard : new NullCard();
                this.game.resolveGameAction(GameActions.bootCard({ card: this.game.shootout.shootoutLocation.locationCard }), context);
                this.untilEndOfPhase(context.ability, ability => ({
                    condition: () => true,
                    match: deedCard,
                    effect: [
                        ability.effects.setProduction(0),
                        ability.effects.setControl(0)
                    ]
                }), PhaseNames.Upkeep
                );
                this.game.addMessage('{0} uses {1} to boot {2} and it does not provide control points or production until after the next Upkeep phase', 
                    context.player, this, deedCard);
            }
        });
    }

    payGR(player) {
        player.modifyGhostRock(-1);
        this.game.addMessage('{0} uses {1} to force {2} to pay 1 GR', 
            player, this, player.getOpponent());        
        return true;
    }

    discardCard(player) {
        player.discardAtRandom(1, discarded => 
            this.game.addMessage('{0} uses {1} to force {2} to discard {3}', 
                player, this, player.getOpponent(), discarded), false);
        return true;
    }    
}

LikeABull.code = '25049';

module.exports = LikeABull;

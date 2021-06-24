const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Outgunned extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Outgunned',
            playType: ['resolution'],
            ifCondition: () => this.getPosseBullets(this.controller) > this.getPosseBullets(this.controller.getOpponent()),
            ifFailMessage: context => {
                this.game.addMessage('{0} uses {1} but it does not have any effect because their posse\'s total bullets is not more than the opposing posse\'s', 
                    context.player, this);
            },
            handler: context => {
                const shooter = this.game.shootout.getPosseByPlayer(context.player).shooter;
                if(!shooter.booted) {
                    const event = this.game.resolveGameAction(GameActions.bootCard({ card: shooter }), context).thenExecute(() => {
                        context.player.modifyRank(2, context);
                        this.game.addMessage('{0} uses {1} and boots his shooter {2} to increase hand rank by 2; Current hand rank is {3}', 
                            context.player, this, shooter, context.player.getTotalRank());
                    });
                    if(event.isNull()) {
                        this.game.addMessage('{0} uses {1} it does not have any effect because his shooter {2} cannot be booted', 
                            context.player, this, shooter);                            
                    }
                } else {
                    this.game.addMessage('{0} uses {1} but it does not have any effect because his shooter {2} is booted', 
                        context.player, this, shooter);                    
                }
            }
        });
    }

    getPosseBullets(player) {
        let playerPosseDudes = this.game.shootout.getPosseByPlayer(player).getDudes();
        return playerPosseDudes.reduce((memo, dude) => memo + dude.bullets, 0);
    }
}

Outgunned.code = '12019';

module.exports = Outgunned;

const ActionCard = require('../../actioncard.js');

class Vamoosin extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Vamoosin\'',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose dude to send home',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    participating: true,
                    wanted: true,
                    condition: (card, context) => 
                        card.influence <= context.player.getSpendableGhostRock({ 
                            activePlayer: context.player,
                            context 
                        })
                },
                cardType: ['dude'],
                gameAction: 'sendHome'
            },
            handler: context => {
                context.player.spendGhostRock(context.target.influence);
                this.game.shootout.sendHome(context.target, context, { needToBoot: false })
                    .thenExecute(() => this.game.addMessage('{0} uses {1} and pays {2} GR to send {3} home', 
                        context.player, this, context.target.influence, context.target
                    ));
            }
        });
    }
}

Vamoosin.code = '23056';

module.exports = Vamoosin;

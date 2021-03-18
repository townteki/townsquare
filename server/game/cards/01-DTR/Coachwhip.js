const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Coachwhip extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Coachwhip!',
            playType: 'cheatin resolution',
            target: {
                choosingPlayer: 'thisIfLegal',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: 'dude'
            },
            handler: context => {
                let action = null;
                if(this.game.shootout) {
                    action = 'ace';
                    this.game.resolveGameAction(GameActions.aceCard({ card: context.target }), context);
                } else if(this.game.currentPhase === 'gambling') {
                    action = 'boot';
                    this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                }
                if(action) {
                    this.game.addMessage('{0} plays {1} to {2} {3}', context.player, this, action, context.target);
                }
            }
        });
    } 
}

Coachwhip.code = '01115';

module.exports = Coachwhip;

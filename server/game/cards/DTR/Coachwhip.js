const ActionCard = require('../../actioncard.js');

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
                    context.target.controller.aceCard(context.target);
                } else if(this.game.currentPhase === 'gambling') {
                    action = 'boot';
                    context.target.controller.bootCard(context.target);
                }
                if(action) {
                    this.game.addMessage('{0} plays {1} to {2} {3}.', this.controller, this, action, context.target);
                }
            }
        });
    } 
}

Coachwhip.code = '01115';

module.exports = Coachwhip;

const GameActions = require('../../GameActions/index.js');
const TechniqueCard = require('../../techniquecard.js');

class ZhusReward extends TechniqueCard {
    setupCardAbilities(ability) {
        this.techniqueAction({
            title: 'Zhu\'s Reward',
            playType: ['shootout'],
            cost: ability.costs.bootKfDude(),
            onSuccess: (context) => {
                const opponent = context.player.getOpponent();
                const opponentPosse = this.game.shootout.getPosseByPlayer(opponent);
                const expelledDudes = [];
                opponentPosse.actOnPosse(dude => {
                    if(dude.value < context.kfDude.bullets) {
                        const event = this.game.resolveGameAction(GameActions.sendHome({ card: dude }), context);
                        if(!event.isNull()) {
                            expelledDudes.push(dude);
                        }
                    }
                });
                if(expelledDudes) {
                    this.game.addMessage('{0} uses {1} to send home booted dude(s) {2}', context.player, this, expelledDudes);
                } else {
                    this.game.addMessage('{0} uses {1} but does not send home booted any dudes', context.player, this);
                }          
            },
            source: this
        });
    }
}

ZhusReward.code = '09040';

module.exports = ZhusReward;

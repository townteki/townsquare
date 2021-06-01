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
                opponentPosse.actOnPosse(dude => {
                    if(dude.value < context.kfDude.bullets) {
                        this.game.resolveGameAction(GameActions.sendHome({ card: dude }), context);
                    }
                });              
            },
            source: this
        });
    }
}

ZhusReward.code = '09040';

module.exports = ZhusReward;

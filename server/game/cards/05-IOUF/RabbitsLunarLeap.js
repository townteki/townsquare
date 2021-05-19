const GameActions = require('../../GameActions/index.js');
const TechniqueCard = require('../../techniquecard.js');

class RabbitsLunarLeap extends TechniqueCard {
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Rabbit\'s Lunar Leap',
            playType: ['shootout:join'],
            actionContext: { gameAction: 'joinPosse' },
            combo: () => {
                const myDudes = this.game.shootout.getPosseByPlayer(this.controller).getDudes();
                const oppDudes = this.game.shootout.getPosseByPlayer(this.controller.getOpponent()).getDudes();
                return myDudes.length <= oppDudes.length;
            },
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: context.kfDude }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to move {2} to posse', context.player, this, context.kfDude);
                });
                if(context.kfDude.booted) {
                    this.game.promptForYesNo(context.player, {
                        title: `Do you want to unboot ${context.kfDude.title}?`,
                        onYes: player => {
                            this.game.resolveGameAction(GameActions.unbootCard({ card: context.kfDude }), context);
                            this.game.addMessage('{0} uses {1} to unboot {2}', player, this, context.kfDude);
                        }
                    });
                }
            },
            source: this
        });
    }
}

RabbitsLunarLeap.code = '09039';

module.exports = RabbitsLunarLeap;

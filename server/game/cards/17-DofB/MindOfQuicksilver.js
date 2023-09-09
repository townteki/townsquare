const GameActions = require('../../GameActions/index.js');
const TechniqueCard = require('../../techniquecard.js');

class MindOfQuicksilver extends TechniqueCard {
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Noon: Mind of Quicksilver',
            playType: ['noon'],
            onSuccess: (context) => {
                context.player.drawCardsToHand(1, context);
                this.game.addMessage('{0} uses {1} to draw a card', context.player, this);
            },
            source: this
        });

        this.techniqueAction({
            title: 'Shootout: Mind of Quicksilver',
            playType: ['shootout'],
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.kfDude }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, context.kfDude);
                });
                if(context.pull.pulledCard) {
                    // set the flag to prevent discarding of pulled card in abilityresolver
                    context.pull.doNotHandlePulledCard = true;
                    if(context.player.moveCardWithContext(context.pull.pulledCard, 'hand', context)) {
                        this.game.addMessage('{0} uses {1} to put pulled card {2} to hand', context.player, this, context.pull.pulledCard);                    
                    } else {
                        context.player.handlePulledCard(context.pull.pulledCard);
                    }                    
                }
            },
            source: this
        });        
    }
}

MindOfQuicksilver.code = '25050';

module.exports = MindOfQuicksilver;

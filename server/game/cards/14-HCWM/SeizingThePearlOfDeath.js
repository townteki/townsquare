const GameActions = require('../../GameActions/index.js');
const TechniqueCard = require('../../techniquecard.js');

class SeizingThePearlOfDeath extends TechniqueCard {
    setupCardAbilities() {
        this.techniqueAction({
            title: 'Seizing the Pearl of Death',
            playType: ['cheatin resolution'],
            onSuccess: (context) => {
                context.player.drawCardsToHand(1, context);
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: 'Choose a dude to send home',
                    waitingPromptTitle: 'Waiting for opponent to select a dude',
                    cardCondition: card => card.location === 'play area' &&
                        card.gamelocation === context.kfDude.gamelocation,
                    cardType: 'dude',
                    gameAction: ['sendHome', 'boot'],
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.sendHome({ card }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to send {2} home booted', player, this, card);
                        });
                        return true;
                    },
                    source: this
                });
                if(this.game.shootout) {
                    context.player.modifyCasualties(-1);
                    context.player.getOpponent().modifyCasualties(1);
                    this.game.addMessage('{0} uses {1} to reduce their casualties by 1 and increase {2}\'s casualties by 1', 
                        context.player, this, context.player.getOpponent());
                }
                if(!context.player.isCheatin()) {
                    this.untilEndOfRound(context.ability, ability => ({
                        match: context.kfDude,
                        effect: [
                            ability.effects.modifyBullets(1),
                            ability.effects.modifyInfluence(1)
                        ]
                    }));
                    this.game.addMessage('{0} uses {1} to give {2} +1 bullets and +1 influence', 
                        context.player, this, context.kfDude);
                }
            },
            source: this
        });
    }
}

SeizingThePearlOfDeath.code = '22056';

module.exports = SeizingThePearlOfDeath;

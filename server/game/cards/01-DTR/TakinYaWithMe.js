const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');
const TakeYerLumpsPrompt = require('../../gamesteps/shootout/takeyerlumpsprompt.js');

class TakinYaWithMe extends ActionCard {
    setupCardAbilities() {
        this.reaction({
            title: 'React: Takin\' Ya With Me',
            when: {
                onTakenCasualties: event => event.shootout.loser === this.controller && 
                    event.player === this.controller &&
                    this.canBeTakenWithMe(event.player, event.shootout, event.casualtiesTaken)
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.increaseCasualties({ 
                    player: context.player.getOpponent(), 
                    amount: 1
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to take some of {2}\'s dudes or sidekicks with them', context.player, this, context.player.getOpponent());
                    this.game.shootout.queueStep(new TakeYerLumpsPrompt(this.game, [context.player.getOpponent().name], this));
                }); 
            }
        });
    }

    canBeTakenWithMe(player, shootout, takenCasualties) {
        let opponentPosseDudes = shootout.getPosseByPlayer(player.getOpponent()).getDudes();
        const reducer = (highest, current) => current > highest ? current : highest;
        let highestBullets = takenCasualties.map(casualty => casualty.bullets || 0).reduce(reducer, 0);
        
        return opponentPosseDudes.some(dude => dude.bullets <= highestBullets);
    }
}

TakinYaWithMe.code = '01140';

module.exports = TakinYaWithMe;

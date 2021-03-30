const ActionCard = require('../../actioncard.js');
const TakeYerLumpsPrompt = require('../../gamesteps/shootout/takeyerlumpsprompt.js');

class TakinYaWithMe extends ActionCard {
    setupCardAbilities() {
        this.reaction({
            when: {
                onTakenCasualties: event => event.shootout.loser === this.controller && 
                    event.player === this.controller &&
                    this.canBeTakenWithMe(event.player, event.shootout, event.casualtiesTaken)
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to take some of {2}\'s dudes or sidekicks with him', context.player, this, context.player.getOpponent()),
            handler: context => {
                this.game.shootout.queueStep(new TakeYerLumpsPrompt(this.game, [context.player.getOpponent().name], 1, this));
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

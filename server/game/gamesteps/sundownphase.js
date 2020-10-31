const _ = require('underscore');
const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const SundownPrompt = require('./sundown/sundownprompt.js');

class SundownPhase extends Phase {
    constructor(game) {
        super(game, 'sundown');
        this.initialise([
            new SimpleStep(game, () => this.checkWinCondition()),
            new SimpleStep(game, () => this.unbootCards()),
            new SimpleStep(game, () => this.sundownRedraw()),            
            new SimpleStep(game, () => this.resetPlayerStatus()),
            new SundownPrompt(game)
        ]);
    }

    sundownRedraw() {
        _.each(this.game.getPlayers(), player => {
            player.sundownRedraw();
        });
    }

    checkWinCondition() {
        let potentialWinner = [];
        _.each(this.game.getPlayers(), player => {
            let opponents = _.reject(this.game.getPlayers(), activePlayer => activePlayer === player);
            if(_.every(opponents, opponent => opponent.getTotalInfluence() < player.getTotalControl())) {
                //console.log("player control points" + player.getTotalControl());
                potentialWinner.push(player);
            }
        });

        if(potentialWinner.length === 1) {
            this.game.recordWinner(potentialWinner[0], 'Control points greater than influence');
        }
        
    }
                 

    unbootCards() { 
        _.each(this.game.getPlayers(), player => {
            player.cardsInPlay.each(card => {
                player.unbootCard(card);
            });
        });
    }
    
    resetPlayerStatus() {
        _.each(this.game.getPlayers(), player => {
            player.resetForRound();
        });
    }

}

module.exports = SundownPhase;

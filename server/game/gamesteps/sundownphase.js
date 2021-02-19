const _ = require('underscore');
const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const DiscardPrompt = require('./sundown/discardprompt.js');
const SundownPrompt = require('./sundown/sundownprompt.js');

class SundownPhase extends Phase {
    constructor(game) {
        super(game, 'sundown');
        this.initialise([
            new SimpleStep(game, () => this.checkWinCondition()),
            new DiscardPrompt(game),
            new SimpleStep(game, () => this.sundownRedraw()),  
            new SimpleStep(game, () => this.unbootCards()),          
            new SimpleStep(game, () => this.roundEnded()),
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
            if(opponents.length > 0 && _.every(opponents, opponent => opponent.getTotalInfluence() < player.getTotalControl())) {
                //console.log("player control points" + player.getTotalControl());
                potentialWinner.push(player);
            }
        });

        if(potentialWinner.length === 1) {
            this.game.recordWinner(potentialWinner[0], 'Control points greater than influence');
        }
        this.game.raiseEvent('onSundownAfterVictoryCheck');
    }

    unbootCards() { 
        _.each(this.game.getPlayers(), player => {
            _.each(player.cardsInPlay, card => {
                player.unbootCard(card);
            });
        });
    }

    roundEnded() {
        this.game.raiseEvent('onRoundEnded');

        let players = this.game.getPlayers();
        players.forEach(player => player.resetForRound());
        this.game.round++;

        this.game.addAlert('endofround', 'End of day {0}', this.game.round);
        this.game.addAlert('startofround', 'Day {0}', this.game.round + 1);

        this.game.checkForTimeExpired();
    }
}

module.exports = SundownPhase;

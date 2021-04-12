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
        this.game.getPlayers().forEach(player => {
            player.sundownRedraw();
        });
    }

    checkWinCondition() {
        let potentialWinner = [];
        this.game.getPlayers().forEach(player => {
            let opponents = this.game.getPlayers().filter(activePlayer => activePlayer !== player);
            if(opponents.length > 0 && opponents.every(opponent => opponent.getTotalInfluence() < player.getTotalControl())) {
                potentialWinner.push(player);
            }
        });

        if(potentialWinner.length === 1) {
            this.game.recordWinner(potentialWinner[0], 'Control points greater than influence');
        }
        this.game.raiseEvent('onSundownAfterVictoryCheck');
    }

    unbootCards() { 
        this.game.getPlayers().forEach(player => {
            player.cardsInPlay.forEach(card => {
                if(!card.options.contains('doesNotUnbootAtSundown')) {
                    player.unbootCard(card);
                }
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

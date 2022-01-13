const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const PhaseNames = require('../Constants/PhaseNames.js');
class SundownPhase extends Phase {
    constructor(game) {
        super(game, PhaseNames.Sundown);
        this.initialise([
            new SimpleStep(game, () => this.game.raiseEvent('onAtStartOfSundown')),
            new SimpleStep(game, () => this.checkWinCondition()),
            new SimpleStep(game, () => this.reportCurrentStats())
        ]);
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
        } else if(potentialWinner.length === 2) {
            if(potentialWinner[0].getTotalControl() > potentialWinner[1].getTotalControl()) {
                this.game.recordWinner(potentialWinner[0], 'Control points greater than influence on tiebreaker');
            }
            if(potentialWinner[1].getTotalControl() > potentialWinner[0].getTotalControl()) {
                this.game.recordWinner(potentialWinner[1], 'Control points greater than influence on tiebreaker');
            }
        }
        this.game.raiseEvent('onSundownAfterVictoryCheck');
    }

    reportCurrentStats() {
        this.game.getPlayers().forEach(player => {
            this.game.addMessage('{0}: {1} CP | {2} influence', player, player.getTotalControl(), player.getTotalInfluence());
        });
    }
}

module.exports = SundownPhase;

const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const CheatingResolutionPrompt = require('./gambling/cheatingresolutionprompt.js');
const DrawHandPrompt = require('./shootout/drawhandprompt.js');

class GamblingPhase extends Phase {
    constructor(game) {
        super(game, 'gambling');

        this.lowballPot = 0;

        this.initialise([
            new SimpleStep(game, () => this.ante()),
            new SimpleStep(game, () => this.game.drawHands(5, null, 'lowball')),
            // TODO M2 Shootout testing - comment out DrawHandPrompt and cheatinResolutions
            new DrawHandPrompt(game),
            new SimpleStep(game, () => this.game.revealHands()),
            new SimpleStep(game, () => this.cheatinResolutions()),
            new SimpleStep(game, () => this.determineWinner()),
            new SimpleStep(game, () => this.game.discardDrawHands()),
            new SimpleStep(game, () => this.resetModifiers())
        ]);
    }

    ante() {
        this.game.getPlayers().forEach(player => {
            if(player.getSpendableGhostRock() <= 0) {
                player.debtor = true;
            } else {
                player.modifyGhostRock(-1);
            }
            this.lowballPot++;
        });
        this.game.raiseEvent('onPlayersAntedForLowball', { gamblingPhase: this });
    }

    cheatinResolutions() {
        this.game.queueStep(new CheatingResolutionPrompt(this.game));  
    }

    findWinner() {
        let onTiebreaker = false;
        const players = this.game.getPlayers();
        if(players.length === 1) {
            return players[0];
        }
        const rank0 = players[0].getTotalRank();
        const rank1 = players[1].getTotalRank();
        let winner = players[0];

        if(rank1 < rank0) {
            winner = players[1];
        } else if(rank0 === rank1) {
            let tiebreakResult = this.game.resolveTiebreaker(players[0], players[1], true);
            if(tiebreakResult === 'exact tie') {
                winner = null;
            }
            onTiebreaker = true;
            winner = tiebreakResult.winner;
        }

        return { player: winner, onTiebreaker: onTiebreaker };
    }

    determineWinner() {
        let winner = this.findWinner();

        if(!winner) {
            this.game.addAlert('info', 'There is no winner of the lowball, players have to draw new hands.');
            this.game.discardDrawHands();
            this.game.drawHands();
            this.game.revealHands();
            // TODO M2 add window for cheatin resolutions
            winner = this.findWinner();
        }

        // TODO M2 need to resolve situation when there is exact tie and no winner
        // for now it will just put some player as first player
        if(!winner.player) {
            winner.player = this.game.getPlayers()[0];
            this.game.addAlert('danger', 'The result was exact tie. Setting {0} as winner', winner.player);
        }
        let debtorText = '';
        if(winner.player.debtor) {
            this.lowballPot--;
            winner.player.debtor = false;
            debtorText = '(-1 borrowed GR)';
        }
        if(winner.onTiebreaker) {
            this.game.addAlert('info', '{0} wins on tie breaker and receives {1} GR{2}', winner.player, this.lowballPot, debtorText);
        } else {
            this.game.addAlert('info', '{0} is the winner and receives {1} GR{2}', winner.player, this.lowballPot, debtorText);
        }
 
        this.game.setFirstPlayer(winner.player);
        this.game.raiseEvent('onLowballWinnerDetermined', { winner: winner.player });
        winner.player.modifyGhostRock(this.lowballPot);
    }

    resetModifiers() {
        this.game.getPlayers().forEach(player => {
            player.rankModifier = 0;
        });
    }
}

module.exports = GamblingPhase;

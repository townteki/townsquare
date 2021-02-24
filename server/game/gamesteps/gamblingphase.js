const _ = require('underscore');
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
            new SimpleStep(game, () => this.game.drawHands()),
            // TODO M2 Shootout testing - comment out DrawHandPrompt and cheatinResolutions
            new DrawHandPrompt(game),
            new SimpleStep(game, () => this.game.revealHands()),
            new SimpleStep(game, () => this.cheatinResolutions()),
            new SimpleStep(game, () => this.determineWinner()),
            new SimpleStep(game, () => this.gainLowballPot()),
            new SimpleStep(game, () => this.game.discardDrawHands())
        ]);
    }

    ante() {
        _.each(this.game.getPlayers(), player => {
            this.game.addGhostRock(player, -1);
            this.lowballPot++;
        });
    }

    cheatinResolutions() {
        this.game.queueStep(new CheatingResolutionPrompt(this.game));  
    }

    findWinner() {
        let onTiebreaker = false;
        let winner = _.reduce(this.game.getPlayers(), (player, memo) => {
            let pRank = player.getTotalRank();
            let mRank = memo.getTotalRank();

            if(pRank < mRank) {
                return player;
            } else if(pRank === mRank) {
                let tiebreakResult = this.game.resolveTiebreaker(player, memo, true);
                if(tiebreakResult === 'exact tie') {
                    return null;
                }
                onTiebreaker = true;
                return tiebreakResult.winner;
            }

            return memo;
        });

        return { player: winner, onTiebreaker: onTiebreaker };
    }

    determineWinner() {
        let winner = this.findWinner();

        if(!winner) {
            this.game.addAlert('info', 'There is winner of the lowball, players have to draw new hands.');
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
            this.game.addAlert('danger', 'The result was exact tie. Setting {0} as winner', winner.player, this.lowballPot);
        } else {
            if(winner.onTiebreaker) {
                this.game.addAlert('info', '{0} wins on tie breaker and receives {1} GR', winner.player, this.lowballPot);
            } else {
                this.game.addAlert('info', '{0} is the winner and receives {1} GR', winner.player, this.lowballPot);
            }
        }

        this.game.getPlayers().forEach(player => player.firstPlayer = winner.player === player);   
        this.game.addGhostRock(winner.player, this.lowballPot);
    }

    gainLowballPot() {

    }
}

module.exports = GamblingPhase;

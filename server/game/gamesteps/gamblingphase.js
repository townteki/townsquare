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

    determineWinner() {
        let winner = _.reduce(this.game.getPlayers(), (player, memo) => {

            let pHand = player.getHandRank();
            let mHand = memo.getHandRank();

            if(pHand.rank < mHand.rank) {
                return player;
            } else if(pHand.rank === mHand.rank) {
                for(let i = 0; i < pHand.tiebreaker.length; i++) {
                    if(pHand.tiebreaker[i] < mHand.tiebreaker[i]) {
                        return player;
                    }
                }
            }

            return memo;
            
        });

        let firstPlayer = winner;

        this.game.addMessage('{0} is the winner and receives {1} GR', winner.name, this.lowballPot);

        _.each(this.game.getPlayers(), player => {
            player.firstPlayer = firstPlayer === player;
        });
        
        this.game.addGhostRock(winner, this.lowballPot);
    }

    gainLowballPot() {

    }
}

module.exports = GamblingPhase;

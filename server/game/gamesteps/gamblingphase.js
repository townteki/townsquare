const _ = require('underscore');
const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const CheatingResolutionPrompt = require('./gambling/cheatingresolutionprompt.js');
const RevealDrawHandPrompt = require('./revealdrawhandprompt.js');

class GamblingPhase extends Phase {
    constructor(game) {
        super(game, 'gambling');

        this.lowballPot = 0;

        this.initialise([
            new SimpleStep(game, () => this.ante()),
            new SimpleStep(game, () => this.drawHands()),
            new RevealDrawHandPrompt(game),
            new SimpleStep(game, () => this.revealHands()),
            new CheatingResolutionPrompt(game),
            new SimpleStep(game, () => this.determineWinner()),
            new SimpleStep(game, () => this.gainLowballPot()),
            new SimpleStep(game, () => this.discardCards())
        ]);
    }

    ante() {
        _.each(this.game.getPlayers(), player => {
            this.game.addGhostRock(player, -1);
            this.lowballPot++;
        });
    }

    drawHands() {
        _.each(this.game.getPlayers(), player => {
            player.drawCardsToHand(5, 'draw hand');
        });
    }

    revealHands() {
        _.each(this.game.getPlayers(), player => {
            player.revealDrawHand();            
        });
    }

    discardCards() {
        _.each(this.game.getPlayers(), player => {
            player.discardDrawHand();
        });
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

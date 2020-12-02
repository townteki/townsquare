const Phase = require('./phase.js');
const ContinuousPlayerOrderPrompt = require('./continuousplayerorderprompt.js');
const PickYerShooterPrompt = require('./shootout/pickyershooterprompt.js');
const ShootoutPossePrompt = require('./shootout/shootoutposseprompt.js');
const TakeYerLumpsPrompt = require('./shootout/takeyerlumpsprompt.js');
const SimpleStep = require('./simplestep.js');
const RunOrGunPrompt = require('./shootout/runorgunprompt.js');
const {ShootoutStatuses} = require('../Constants');
const DrawHandPrompt = require('./shootout/drawhandprompt.js');
const ShootoutPosse = require('./shootout/shootoutposse.js');

// Pseudo phase which is not part of the main pipeline.
class Shootout extends Phase {
    constructor(game, phase, leader, mark, options = { isJob: false }) {
        super(game, 'Shootout');
        this.highNoonPhase = phase;
        this.options = options;
        this.leader = leader;
        leader.shootoutStatus = ShootoutStatuses.LeaderPosse;
        this.leaderPosse = new ShootoutPosse(this, leader);
        this.leaderPlayerName = leader.controller.name;
        this.mark = mark;
        mark.shootoutStatus = ShootoutStatuses.MarkPosse;
        this.markPosse = new ShootoutPosse(this, mark);
        this.markPlayerName = mark.controller.name;
        this.leaderMarkOrder = [this.leader.controller.name, this.mark.controller.name];
        this.shootoutLoseWinOrder = [];
        this.remainingSteps = [];
        this.initialise([
            new ShootoutPossePrompt(this.game, this, this.leaderMarkOrder),
            new SimpleStep(this.game, () => this.gatherPosses()),
            new SimpleStep(this.game, () => this.breakinAndEnterin()),
            new SimpleStep(this, () => this.beginShootoutRound())
        ]);
    }

    get leaderPlayer() {
        if (!this.game || !this.leaderPlayerName) {
            return null;
        }
        return this.game.getPlayerByName(this.leaderPlayerName);
    }

    get markPlayer() {
        if (!this.game || !this.markPlayerName) {
            return null;
        }
        return this.game.getPlayerByName(this.markPlayerName);
    }

    get shootoutLocation() {
        return this.game.findLocation(this.mark.gamelocation);
    }   

    isJob() {
        return this.options.isJob;
    }

    beginShootoutRound() {
        this.remainingSteps = [
            new ContinuousPlayerOrderPrompt(this.game, 'Make Shootout plays'),
            new PickYerShooterPrompt(this.game, this.leaderMarkOrder),
            new SimpleStep(this.game, () => this.announcePreDraw()),
            new SimpleStep(this.game, () => this.draw()),
            new SimpleStep(this.game, () => this.revealHands()),
            new ContinuousPlayerOrderPrompt(this.game, 'Make Resolution plays'),
            new SimpleStep(this.game, () => this.determineWinner()),
            new TakeYerLumpsPrompt(this.game, this.shootoutLoseWinOrder),
            new RunOrGunPrompt(this.game, this.shootoutLoseWinOrder)
        ];

        this.game.raiseEvent('onBeginShootoutRound');
        this.queueStep(new SimpleStep(this.game, () => {
            if (!this.checkEndCondition()) {
                if (this.remainingSteps.length !== 0) {
                    let step = this.remainingSteps.shift();
                    this.queueStep(step);
                    return false;
                }
            } else {
                return true;
            }
        }));
        this.queueStep(new SimpleStep(this, () => this.chamberAnotherRound()));
    }

    startPhase() {
        for(const player of this.game.getPlayers()) {
            player.phase = this.name;
        }        
        this.game.raiseEvent('onShootoutStarted');
        this.game.addAlert('phasestart', 'Shootout started!');          
    }

    endPhase() {
        this.game.raiseEvent('onShootoutEnded', { phase: this.name });
        this.game.currentPhase = this.highNoonPhase;
        var attackingPlayer = this.leaderPlayer;
        var defendingPlayer = this.markPlayer;
        attackingPlayer.phase = this.highNoonPhase;
        defendingPlayer.phase = this.highNoonPhase;

        this.actOnAllParticipants(dude => dude.shootoutStatus = ShootoutStatuses.None);
        this.game.endShootout();
        this.game.addAlert('phasestart', 'Shootout ended!');     
    }

    queueStep(step) {
        this.pipeline.queueStep(step);
    }

    isInLeaderPosse(card) {
        return this.leaderPosse.isInPosse(card);
    }

    isInMarkPosse(card) {
        return this.markPosse.isInPosse(card);
    }

    isInShootout(card) {
        return this.isInLeaderPosse(card) || this.isInMarkPosse(card);
    }

    belongsToLeaderPlayer(dude) {
        return dude.controller.name === this.leader.controller.name;
    }

    belongsToMarkPlayer(dude) {
        return dude.controller.name === this.mark.controller.name;
    }

    checkEndCondition() {
        return !this.leaderPosse || !this.markPosse || this.leaderPosse.isEmpty() || this.markPosse.isEmpty();
    }

    getLeaderDrawCount() {
        return { player: this.leaderPlayer, number: 5 + this.leaderPosse.getStudBonus() };
    }

    getMarkDrawCount() {
        return { player: this.markPlayer, number: 5 + this.markPosse.getStudBonus() };
    }

    addToPosse(dude) {
        if (this.belongsToLeaderPlayer(dude)) {
            this.leaderPosse.addToPosse(dude);
        } else if (this.belongsToMarkPlayer(dude)) {
            this.markPosse.addToPosse(dude);
        }
    }

    removeFromPosse(dude) {
        if (this.belongsToLeaderPlayer(dude)) {
            this.leaderPosse.removeFromPosse(dude);
        } else if (this.belongsToMarkPlayer(dude)) {
            this.markPosse.removeFromPosse(dude);
        }   
    }

    gatherPosses() {
        this.actOnAllParticipants(dude => dude.moveToShootoutLocation());
    }

    pickShooter(dude) {
        if (this.isInLeaderPosse(dude)) {
            this.leaderPosse.pickShooter(dude);
            return;
        }
        if (this.isInMarkPosse(dude)) {
            this.markPosse.pickShooter(dude);
        }
    }

    actOnLeaderPosse(action) {
        this.leaderPosse.actOnPosse(action);
    }

    actOnMarkPosse(action) {
        this.markPosse.actOnPosse(action);
    }

    actOnAllParticipants(action) {
        this.actOnLeaderPosse(action);
        this.actOnMarkPosse(action);
    }

    breakinAndEnterin() {
        if (this.shootoutLocation.isTownSquare()) {
            return;
        }
        let locationCard = this.shootoutLocation.getLocationCard(this.game);
        if (locationCard && (locationCard.getType() === 'outfit' || locationCard.hasKeyword('private'))) {
            if (locationCard.owner !== this.leaderPlayer) {
                this.actOnLeaderPosse(dude => dude.increaseBounty());
            } else {
                this.actOnMarkPosse(dude => dude.increaseBounty());
            }
        }
    }

    draw() {
        this.queueStep(new DrawHandPrompt(this.game, [ this.getLeaderDrawCount(), this.getMarkDrawCount() ]));
    }

    revealHands() {
        this.game.revealHands();
    }

    determineWinner() {
        this.shootoutLoseWinOrder = [];
        let markHand = this.markPlayer.getHandRank();
        let leaderHand = this.leaderPlayer.getHandRank();
        let winner = this.markPlayer;
        let loser = this.leaderPlayer;
        if (leaderHand.rank == markHand.rank) {
            for(let i = 0; i < leaderHand.tiebreaker.length; i++) {
                if(leaderHand.tiebreaker[i] > markHand.tiebreaker[i]) {
                    winner = this.leaderPlayer;
                    loser = this.markPlayer;
                }
            }
            winner.handResult.casaulties = loser.handResult.casaulties = 1;
            this.game.addMessage('Shootout ended in a tie, but {0} wins on tiebreaker.', winner);
        } else {
            if (leaderHand.rank > markHand.rank) {
                winner = this.leaderPlayer;
                loser = this.markPlayer;
            }
            loser.handResult.casaulties = Math.abs(leaderHand.rank - markHand.rank);
            this.game.addMessage('{0} is the winner of this shootout by {1} ranks.', winner, Math.abs(leaderHand.rank - markHand.rank));
        }
        this.shootoutLoseWinOrder = [ loser, winner ];
    }

    chamberAnotherRound() {
        this.queueStep(new SimpleStep(this.game, () => this.game.discardDrawHands()));
        if (!this.checkEndCondition()) {
            this.game.addAlert('info', 'Both players Chamber another round and go to next round of shootout.');
            this.queueStep(new SimpleStep(this.game, () => this.beginShootoutRound()));
        }   
    }

    announcePreDraw() {

    }

}

module.exports = Shootout;
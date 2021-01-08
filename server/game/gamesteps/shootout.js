const Phase = require('./phase.js');
const ContinuousPlayerOrderPrompt = require('./continuousplayerorderprompt.js');
const PickYerShooterPrompt = require('./shootout/pickyershooterprompt.js');
const ShootoutPossePrompt = require('./shootout/shootoutposseprompt.js');
const TakeYerLumpsPrompt = require('./shootout/takeyerlumpsprompt.js');
const SimpleStep = require('./simplestep.js');
const RunOrGunPrompt = require('./shootout/runorgunprompt.js');
const {ShootoutStatuses, ShootoutSteps} = require('../Constants');
const DrawHandPrompt = require('./shootout/drawhandprompt.js');
const ShootoutPosse = require('./shootout/shootoutposse.js');
const GameActions = require('../GameActions/index.js');
const ChooseYesNoPrompt = require('./ChooseYesNoPrompt.js');

// Pseudo phase which is not part of the main pipeline.
class Shootout extends Phase {
    constructor(game, phase, leader, mark, options = { isJob: false }) {
        super(game, 'Shootout');
        this.highNoonPhase = phase;
        this.options = options;
        this.leader = leader;
        this.mark = mark;
        this.leader.shootoutStatus = ShootoutStatuses.LeaderPosse;
        this.leaderPlayerName = this.leader.controller.name;
        this.leaderPosse = new ShootoutPosse(this, this.leaderPlayer, this.leader);
        if (!this.isJob()) {
            this.mark.shootoutStatus = ShootoutStatuses.MarkPosse;
            this.opposingPlayerName = this.mark.controller.name;
            this.opposingPosse = new ShootoutPosse(this, this.opposingPlayer, this.mark);
        }

        this.shootoutLoseWinOrder = [];
        this.remainingSteps = [];
        this.currentStep = ShootoutSteps.any;
        this.initialise([
            new SimpleStep(this.game, () => this.initialiseLeaderPosse()),
            new SimpleStep(this.game, () => this.initialiseOpposingPosse()),
            new SimpleStep(this.game, () => this.gatherPosses()),
            new SimpleStep(this.game, () => this.breakinAndEnterin()),
            new SimpleStep(this, () => this.beginShootoutRound())
        ]);
    }

    initialiseLeaderPosse() {
        this.queueStep(new ShootoutPossePrompt(this.game, this, this.leaderPlayer));      
    }

    initialiseOpposingPosse() {
        if (!this.isJob()) {
            this.queueStep(new ShootoutPossePrompt(this.game, this, this.opposingPlayer));
        } else {
            let opponent = this.leaderPlayer.getOpponent();
            this.opposingPlayerName = opponent.name;
            this.game.queueStep(new ChooseYesNoPrompt(this.game, opponent, {
                title: 'Do you want to oppose?',
                onYes: () => {
                    this.opposingPosse = new ShootoutPosse(this, this.opposingPlayer);
                    this.queueStep(new ShootoutPossePrompt(this.game, this, this.opposingPlayer));                    
                },
                onNo: () => {
                    this.recordJobStatus();
                }
            }));
        }
        this.leaderOpponentOrder = [this.leader.controller.name, this.opposingPlayerName];
    }

    get leaderPlayer() {
        if (!this.game || !this.leaderPlayerName) {
            return null;
        }
        return this.game.getPlayerByName(this.leaderPlayerName);
    }

    get opposingPlayer() {
        if (!this.game || !this.opposingPlayerName) {
            return null;
        }
        return this.game.getPlayerByName(this.opposingPlayerName);
    }

    get shootoutLocation() {
        return this.game.findLocation(this.mark.gamelocation);
    }   

    isJob() {
        return this.options.isJob;
    }

    beginShootoutRound() {
        if (this.checkEndCondition()) {
            return;
        }
        this.game.raiseEvent('onShootoutSlinginLeadStarted');
        this.remainingSteps = [
            new SimpleStep(this.game, () => this.shootoutPlays()),
            new SimpleStep(this.game, () => this.pickYerShooterStep()),
            new SimpleStep(this.game, () => this.draw()),
            new SimpleStep(this.game, () => this.revealHands()),
            new SimpleStep(this.game, () => this.resolutionPlays()),
            new SimpleStep(this.game, () => this.endResolution()),
            new SimpleStep(this.game, () => this.determineWinner()),
            new SimpleStep(this.game, () => this.casualtiesAndRunOrGun())
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
        this.game.raiseEvent('onShootoutPhaseStarted');
        let phaseName = this.isJob() ? 'Job' : 'Shootout';
        this.game.addAlert('phasestart', phaseName + ' started!');        
    }

    endPhase() {
        this.game.raiseEvent('onShootoutPhaseFinished', { phase: this.name });
        this.game.currentPhase = this.highNoonPhase;
        var attackingPlayer = this.leaderPlayer;
        var defendingPlayer = this.opposingPlayer;
        attackingPlayer.phase = this.highNoonPhase;
        defendingPlayer.phase = this.highNoonPhase;

        this.actOnAllParticipants(dude => dude.shootoutStatus = ShootoutStatuses.None);
        this.game.endShootout();
        let phaseName = this.isJob() ? 'Job' : 'Shootout';
        this.game.addAlert('phasestart', phaseName + ' ended!');        
    }

    queueStep(step) {
        this.pipeline.queueStep(step);
    }

    getPosseByPlayer(player) {
        if (player === this.leaderPlayer) {
            return this.leaderPosse;
        }
        if (player === this.opposingPlayer) {
            return this.opposingPosse;
        }
    }

    isInLeaderPosse(card) {
        return this.leaderPosse.isInPosse(card);
    }

    isInOpposingPosse(card) {
        return this.opposingPosse.isInPosse(card);
    }

    isInShootout(card) {
        return this.isInLeaderPosse(card) || this.isInOpposingPosse(card);
    }

    belongsToLeaderPlayer(dude) {
        return dude.controller.name === this.leaderPlayerName;
    }

    belongsToOpposingPlayer(dude) {
        return dude.controller.name === this.opposingPlayerName;
    }

    checkEndCondition() {
        return !this.leaderPosse || !this.opposingPosse || this.leaderPosse.isEmpty() || this.opposingPosse.isEmpty();
    }

    getLeaderDrawCount() {
        return { player: this.leaderPlayer, number: 5 + this.leaderPosse.getStudBonus() };
    }

    getOpposingDrawCount() {
        return { player: this.opposingPlayer, number: 5 + this.opposingPosse.getStudBonus() };
    }

    runHome(card) {
        this.removeFromPosse(card);
        this.game.resolveGameAction(GameActions.sendHome({ card: card, options: { isCardEffect: false } }));
    }

    addToPosse(dude) {
        if (this.belongsToLeaderPlayer(dude)) {
            this.leaderPosse.addToPosse(dude);
        } else if (this.belongsToOpposingPlayer(dude)) {
            this.opposingPosse.addToPosse(dude);
        }
    }

    removeFromPosse(dude) {
        if (this.belongsToLeaderPlayer(dude) && this.leaderPosse) {
            this.leaderPosse.removeFromPosse(dude);
        } else if (this.belongsToOpposingPlayer(dude) && this.opposingPosse) {
            this.opposingPosse.removeFromPosse(dude);
        }   
    }

    gatherPosses() {
        if (!this.checkEndCondition()) {
            this.actOnAllParticipants(dude => dude.moveToShootoutLocation());
        }
    }

    shootoutPlays() {
        this.currentStep = ShootoutSteps.shootout;
        this.queueStep(new ContinuousPlayerOrderPrompt(this.game, 'Make Shootout plays'));
    }

    pickYerShooterStep() {
        this.currentStep = ShootoutSteps.any;
        this.queueStep(new PickYerShooterPrompt(this.game, this.leaderOpponentOrder));
    }

    pickShooter(dude) {
        if (this.isInLeaderPosse(dude)) {
            this.leaderPosse.pickShooter(dude);
            return;
        }
        if (this.isInOpposingPosse(dude)) {
            this.opposingPosse.pickShooter(dude);
        }
    }

    actOnLeaderPosse(action) {
        if (this.leaderPosse) {
            this.leaderPosse.actOnPosse(action);
        }
    }

    actOnOpposingPosse(action) {
        if (this.opposingPosse) {
            this.opposingPosse.actOnPosse(action);
        }
    }

    actOnAllParticipants(action) {
        this.actOnLeaderPosse(action);
        this.actOnOpposingPosse(action);
    }

    breakinAndEnterin() {
        if (this.checkEndCondition() || this.shootoutLocation.isTownSquare()) {
            return;
        }
        let locationCard = this.shootoutLocation.getLocationCard(this.game);
        if (locationCard && (locationCard.getType() === 'outfit' || locationCard.hasKeyword('private'))) {
            if (locationCard.owner !== this.leaderPlayer) {
                this.actOnLeaderPosse(dude => dude.increaseBounty());
            } else {
                this.actOnOpposingPosse(dude => dude.increaseBounty());
            }
        }
    }

    draw() {
        this.currentStep = ShootoutSteps.any;
        this.queueStep(new DrawHandPrompt(this.game, [ this.getLeaderDrawCount(), this.getOpposingDrawCount() ]));
    }

    revealHands() {
        this.currentStep = ShootoutSteps.reveal;
        this.game.revealHands();
    }

    resolutionPlays() {
        this.currentStep = ShootoutSteps.resolution;
        this.queueStep(new ContinuousPlayerOrderPrompt(this.game, 'Make Resolution plays'));
    }

    endResolution() {
        this.currentStep = ShootoutSteps.any;
        this.game.raiseEvent('onResolutionStepFinished', { phase: this.name });        
    }

    determineWinner() {
        this.shootoutLoseWinOrder = [];
        let opposingHand = this.opposingPlayer.getHandRank();
        let leaderHand = this.leaderPlayer.getHandRank();
        let winner = this.opposingPlayer;
        let loser = this.leaderPlayer;
        if (leaderHand.rank == opposingHand.rank) {
            for(let i = 0; i < leaderHand.tiebreaker.length; i++) {
                if(leaderHand.tiebreaker[i] > opposingHand.tiebreaker[i]) {
                    winner = this.leaderPlayer;
                    loser = this.opposingPlayer;
                }
            }
            winner.handResult.casualties = loser.handResult.casualties = 1;
            this.game.addMessage('Shootout ended in a tie, but {0} wins on tiebreaker.', winner);
        } else {
            if (leaderHand.rank > opposingHand.rank) {
                winner = this.leaderPlayer;
                loser = this.opposingPlayer;
            }
            loser.handResult.casualties = Math.abs(leaderHand.rank - opposingHand.rank);
            this.game.addMessage('{0} is the winner of this shootout by {1} ranks.', winner, Math.abs(leaderHand.rank - opposingHand.rank));
        }
        this.shootoutLoseWinOrder = [ loser.name, winner.name ];
    }

    casualtiesAndRunOrGun() {
        this.queueStep(new TakeYerLumpsPrompt(this.game, this.shootoutLoseWinOrder));
        this.queueStep(new RunOrGunPrompt(this.game, this.shootoutLoseWinOrder));
    }

    chamberAnotherRound() {
        this.queueStep(new SimpleStep(this.game, () => this.game.discardDrawHands()));
        if (!this.checkEndCondition()) {
            this.game.addAlert('info', 'Both players Chamber another round and go to next round of shootout.');
            this.queueStep(new SimpleStep(this.game, () => this.beginShootoutRound()));
        } else {
            if (this.isJob()) {
                this.actOnLeaderPosse(card => this.runHome(card)); 
            }
        }
    }

    recordJobStatus() {
        if (!this.isJob()) {
            return;
        }
        if (!this.opposingPosse || this.opposingPosse.isEmpty()) {
            this.options.jobAbility.setResult(true, this);
        }
        if (!this.leaderPosse || this.leaderPosse.isEmpty()) {
            this.options.jobAbility.setResult(false, this);
        }
        
    }

}

module.exports = Shootout;
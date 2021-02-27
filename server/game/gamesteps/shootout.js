const Phase = require('./phase.js');
const PickYerShooterPrompt = require('./shootout/pickyershooterprompt.js');
const ShootoutPossePrompt = require('./shootout/shootoutposseprompt.js');
const TakeYerLumpsPrompt = require('./shootout/takeyerlumpsprompt.js');
const SimpleStep = require('./simplestep.js');
const RunOrGunPrompt = require('./shootout/runorgunprompt.js');
const {ShootoutStatuses} = require('../Constants');
const DrawHandPrompt = require('./shootout/drawhandprompt.js');
const ShootoutPosse = require('./shootout/shootoutposse.js');
const GameActions = require('../GameActions/index.js');
const ChooseYesNoPrompt = require('./ChooseYesNoPrompt.js');
const PlayWindow = require('./playwindow.js');

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
        this.leaderPosse = new ShootoutPosse(this, this.leaderPlayer, true);
        if(!this.isJob()) {
            this.mark.shootoutStatus = ShootoutStatuses.MarkPosse;
            this.opposingPlayerName = this.mark.controller.name;
            this.opposingPosse = new ShootoutPosse(this, this.opposingPlayer, false);
        }

        this.jobSuccessful = null;
        this.headlineUsed = false;
        this.shootoutLoseWinOrder = [];
        this.remainingSteps = [];
        this.initialise([
            new SimpleStep(this.game, () => this.initialiseLeaderPosse()),
            new SimpleStep(this.game, () => this.initialiseOpposingPosse()),
            new SimpleStep(this.game, () => this.gatherPosses()),
            new SimpleStep(this.game, () => this.breakinAndEnterin()),
            new SimpleStep(this.game, () => this.beginShootoutRound())
        ]);
    }

    initialiseLeaderPosse() {
        this.queueStep(new ShootoutPossePrompt(this.game, this, this.leaderPlayer));      
    }

    initialiseOpposingPosse() {
        if(!this.isJob()) {
            this.queueStep(new ShootoutPossePrompt(this.game, this, this.opposingPlayer));
        } else {
            let opponent = this.leaderPlayer.getOpponent();
            if(this.game.getNumberOfPlayers() < 2) {
                this.endJob();
            } else {
                this.opposingPlayerName = opponent.name;
                this.game.queueStep(new ChooseYesNoPrompt(this.game, opponent, {
                    title: 'Do you want to oppose?',
                    onYes: () => {
                        this.opposingPosse = new ShootoutPosse(this, this.opposingPlayer);
                        this.queueStep(new ShootoutPossePrompt(this.game, this, this.opposingPlayer));                    
                    },
                    onNo: () => {
                        this.endJob();
                    }
                }));
            }
        }
        this.leaderOpponentOrder = [this.leader.controller.name, this.opposingPlayerName];
    }

    get leaderPlayer() {
        if(!this.game || !this.leaderPlayerName) {
            return null;
        }
        return this.game.getPlayerByName(this.leaderPlayerName);
    }

    get opposingPlayer() {
        if(!this.game || !this.opposingPlayerName) {
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

    resetForTheRound() {
        this.winner = null;
        this.looser = null;
        this.leaderPlayer.rankModifier = 0;
        this.leaderPlayer.casualties = 0;
        this.opposingPlayer.rankModifier = 0;
        this.opposingPlayer.casualties = 0;
    }

    beginShootoutRound() {
        if(this.checkEndCondition()) {
            return;
        }
        this.game.raiseEvent('onShootoutSlinginLeadStarted');
        this.remainingSteps = [
            new SimpleStep(this.game, () => this.resetForTheRound()),
            new SimpleStep(this.game, () => this.shootoutPlays()),
            new SimpleStep(this.game, () => this.pickYerShooterStep()),
            new SimpleStep(this.game, () => this.draw()),
            new SimpleStep(this.game, () => this.game.revealHands()),
            new SimpleStep(this.game, () => this.resolutionPlays()),
            new SimpleStep(this.game, () => this.determineWinner()),
            new SimpleStep(this.game, () => this.casualtiesAndRunOrGun())
        ];

        this.game.raiseEvent('onBeginShootoutRound');
        this.queueStep(new SimpleStep(this.game, () => {
            if(!this.checkEndCondition()) {
                if(this.remainingSteps.length !== 0) {
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

    endPhase(isCancel = false) {
        this.game.raiseEvent('onShootoutPhaseFinished', { phase: this.name });
        this.game.currentPhase = this.highNoonPhase;
        var attackingPlayer = this.leaderPlayer;
        var defendingPlayer = this.opposingPlayer;
        attackingPlayer.phase = this.highNoonPhase;
        if(defendingPlayer) {
            defendingPlayer.phase = this.highNoonPhase;
        }

        this.actOnAllParticipants(dude => dude.shootoutStatus = ShootoutStatuses.None);
        this.game.endShootout(isCancel);
        if(this.isJob()) {
            this.options.jobAbility.setResult(this.jobSuccessful, this);
            this.options.jobAbility.reset();
        }
        let phaseName = this.isJob() ? 'Job' : 'Shootout';
        this.game.addAlert('phasestart', phaseName + ' ended!');        
    }

    endJob(recordStatus = true) {
        if(!this.isJob()) {
            return;
        }
        if(recordStatus) {
            this.recordJobStatus();
        }
        this.actOnLeaderPosse(card => this.sendHome(card, { isCardEffect: false }));
    }

    queueStep(step) {
        this.pipeline.queueStep(step);
    }

    getPosseByPlayer(player) {
        if(player === this.leaderPlayer) {
            return this.leaderPosse;
        }
        if(player === this.opposingPlayer) {
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
        return { 
            player: this.leaderPlayer, 
            number: 5 + this.leaderPosse.getStudBonus(), 
            redraw: this.leaderPosse.getDrawBonus() 
        };
    }

    getOpposingDrawCount() {
        return { 
            player: this.opposingPlayer, 
            number: 5 + this.opposingPosse.getStudBonus(), 
            redraw: this.opposingPosse.getDrawBonus() 
        };
    }

    sendHome(card, options) {
        this.removeFromPosse(card);  
        this.game.resolveGameAction(GameActions.sendHome({ card: card, options: options }));
    }

    addToPosse(dude) {
        if(this.belongsToLeaderPlayer(dude)) {
            this.leaderPosse.addToPosse(dude);
        } else if(this.belongsToOpposingPlayer(dude)) {
            this.opposingPosse.addToPosse(dude);
        }
    }

    removeFromPosse(dude) {
        this.game.raiseEvent('onDudeLeftPosse', { card: dude, shootout: this }, event => {
            if(event.shootout.belongsToLeaderPlayer(event.card) && event.shootout.leaderPosse) {
                event.shootout.leaderPosse.removeFromPosse(event.card);
            } else if(event.shootout.belongsToOpposingPlayer(event.card) && event.shootout.opposingPosse) {
                event.shootout.opposingPosse.removeFromPosse(event.card);
            }
            if(this.jobSuccessful === null) {
                this.recordJobStatus();
            }
        });
    }

    gatherPosses() {
        if(!this.checkEndCondition()) {
            this.actOnAllParticipants(dude => dude.moveToShootoutLocation());
        }
    }

    shootoutPlays() {
        this.queueStep(new PlayWindow(this.game, 'shootout plays', 'Make Shootout plays'));
    }

    pickYerShooterStep() {
        this.queueStep(new PickYerShooterPrompt(this.game, this.leaderOpponentOrder));
    }

    pickShooter(dude) {
        if(this.isInLeaderPosse(dude)) {
            this.leaderPosse.pickShooter(dude);
            return;
        }
        if(this.isInOpposingPosse(dude)) {
            this.opposingPosse.pickShooter(dude);
        }
    }

    actOnLeaderPosse(action, exception) {
        if(this.leaderPosse) {
            this.leaderPosse.actOnPosse(action, exception);
        }
    }

    actOnOpposingPosse(action, exception) {
        if(this.opposingPosse) {
            this.opposingPosse.actOnPosse(action, exception);
        }
    }

    actOnPlayerPosse(player, action, exception) {
        if(this.leaderPlayer === player) {
            this.actOnLeaderPosse(action, exception);
        } else if(this.opposingPlayer === player) {
            this.actOnOpposingPosse(action, exception);
        }
    }

    actOnAllParticipants(action) {
        this.actOnLeaderPosse(action);
        this.actOnOpposingPosse(action);
    }

    breakinAndEnterin() {
        if(this.checkEndCondition() || this.shootoutLocation.isTownSquare()) {
            return;
        }
        let locationCard = this.shootoutLocation.locationCard;
        if(locationCard && (locationCard.getType() === 'outfit' || locationCard.hasKeyword('private'))) {
            if(locationCard.owner !== this.leaderPlayer) {
                this.actOnLeaderPosse(dude => dude.increaseBounty(), dude => dude.shootoutOptions.contains('doesNotGetBountyOnJoin'));
            } else {
                this.actOnOpposingPosse(dude => dude.increaseBounty(), dude => dude.shootoutOptions.contains('doesNotGetBountyOnJoin'));
            }
        }
    }

    draw() {
        this.queueStep(new DrawHandPrompt(this.game, [this.getLeaderDrawCount(), this.getOpposingDrawCount()]));
    }

    resolutionPlays() {
        this.queueStep(new PlayWindow(this.game, 'shootout resolution', 'Make Resolution plays'));
    }

    determineWinner() {
        this.shootoutLoseWinOrder = [];
        let opposingRank = this.opposingPlayer.getTotalRank();
        let leaderRank = this.leaderPlayer.getTotalRank();
        this.winner = this.opposingPlayer;
        this.loser = this.leaderPlayer;
        if(leaderRank === opposingRank) {
            let tiebreakResult = this.game.resolveTiebreaker(this.leaderPlayer, this.opposingPlayer);
            this.leaderPlayer.casualties = this.opposingPlayer.casualties = 1;
            if(tiebreakResult.decision === 'exact tie') {
                this.game.addMessage('Shootout ended in an exact tie, there is no winner or loser.');
                this.shootoutLoseWinOrder = [this.leaderPlayer.name, this.opposingPlayer.name];
                this.winner = null;
                this.loser = null;
                return;
            }
            this.winner = tiebreakResult.winner;
            this.loser = tiebreakResult.loser;
            this.game.addMessage('Shootout ended in a tie, but {0} wins on {1}.', this.winner, tiebreakResult.decision);
        } else {
            if(leaderRank > opposingRank) {
                this.winner = this.leaderPlayer;
                this.loser = this.opposingPlayer;
            }
            this.loser.casualties = Math.abs(leaderRank - opposingRank);
            this.game.addMessage('{0} is the winner of this shootout by {1} ranks.', this.winner, Math.abs(leaderRank - opposingRank));
        }
        this.shootoutLoseWinOrder = [this.loser.name, this.winner.name];
    }

    casualtiesAndRunOrGun() {
        this.queueStep(new TakeYerLumpsPrompt(this.game, this.shootoutLoseWinOrder));
        this.queueStep(new RunOrGunPrompt(this.game, this.shootoutLoseWinOrder));
    }

    chamberAnotherRound() {
        this.queueStep(new SimpleStep(this.game, () => this.game.discardDrawHands()));
        if(!this.checkEndCondition()) {
            this.game.addAlert('info', 'Both players Chamber another round and go to next round of shootout.');
            this.queueStep(new SimpleStep(this.game, () => this.beginShootoutRound()));
        } else {
            this.endJob(false);
        }
    }

    recordJobStatus() {
        if(!this.isJob()) {
            return;
        }
        if(!this.opposingPosse || this.opposingPosse.isEmpty()) {
            this.jobSuccessful = true;
        }
        if(!this.leaderPosse || this.leaderPosse.isEmpty()) {
            this.jobSuccessful = false;
        }
    }
}

module.exports = Shootout;

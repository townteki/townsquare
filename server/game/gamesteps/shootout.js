const Phase = require('./phase.js');
const RevealDrawHandPrompt = require('./revealdrawhandprompt.js');
const ContinuousPlayerOrderPrompt = require('./continuousplayerorderprompt.js');
const PickYerShooterPrompt = require('./shootout/pickyershooterprompt.js');
const ShootoutPossePrompt = require('./shootout/shootoutposseprompt.js');
const TakeYerLumpsPrompt = require('./shootout/takeyerlumpsprompt.js');
const SimpleStep = require('./simplestep.js');
const RunOrGunPrompt = require('./shootout/runorgunprompt.js');
const {ShootoutStatuses} = require('../Constants');

// Pseudo phase which is not part of the main pipeline.
class Shootout extends Phase {
    constructor(game, phase, leader, mark, options = { isJob: false }) {
        super(game, 'Shootout');
        this.highNoonPhase = phase;
        this.options = options;
        this.leader = leader;
        this.leaderPosse = [leader.uuid];
        leader.shootoutStatus = ShootoutStatuses.LeaderPosse;
        this.leaderPlayerName = leader.controller.name;
        this.mark = mark;
        this.markPosse = [mark.uuid];
        mark.shootoutStatus = ShootoutStatuses.MarkPosse;
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

    isJob() {
        return this.options.isJob;
    }

    beginShootoutRound() {
        this.remainingSteps = [
            new ContinuousPlayerOrderPrompt(this.game, 'Make Shootout plays'),
            new PickYerShooterPrompt(this.game, this.leaderMarkOrder),
            new SimpleStep(this.game, () => this.announcePreDraw()),
            new SimpleStep(this.game, () => this.draw()),
            new RevealDrawHandPrompt(this.game),
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

        this.leaderPosse.forEach(dudeUuid => {
            var dude = attackingPlayer.findCardInPlayByUuid(dudeUuid);
            dude.shootoutStatus = ShootoutStatuses.None; 
        });
        this.markPosse.forEach(dudeUuid => {
            var dude = defendingPlayer.findCardInPlayByUuid(dudeUuid);
            dude.shootoutStatus = ShootoutStatuses.None; 
        });
        this.game.endShootout();
        this.game.addAlert('phasestart', 'Shootout ended!');     
    }

    queueStep(step) {
        this.pipeline.queueStep(step);
    }

    getLocation() {
        return this.game.findLocation(this.mark.gamelocation);
    }

    isDudeInLeaderPosse(dude) {
        return this.leaderPosse.includes(dude.uuid);
    }

    isDudeInMarkPosse(dude) {
        return this.markPosse.includes(dude.uuid);
    }

    isDudeInShootout(dude) {
        return this.isDudeInLeaderPosse(dude) || this.isDudeInMarkPosse(dude);
    }

    belongsToLeaderPlayer(dude) {
        return dude.controller.name === this.leader.controller.name;
    }

    belongsToMarkPlayer(dude) {
        return dude.controller.name === this.mark.controller.name;
    }

    checkEndCondition() {
        return this.leaderPosse.length === 0 || this.markPosse.length === 0;
    }

    addToPosse(dude) {
        if (this.belongsToLeaderPlayer(dude)) {
            this.leaderPosse.push(dude.uuid);
            dude.shootoutStatus = ShootoutStatuses.LeaderPosse;
        } else if (this.belongsToMarkPlayer(dude)) {
            this.markPosse.push(dude.uuid);
            dude.shootoutStatus = ShootoutStatuses.MarkPosse;
        }
    }

    removeFromPosse(dude) {
        if (this.belongsToLeaderPlayer(dude)) {
            this.leaderPosse = this.leaderPosse.filter(posseDudeUuid => posseDudeUuid !== dude.uuid);
        } else if (this.belongsToMarkPlayer(dude)) {
            this.markPosse = this.markPosse.filter(posseDudeUuid => posseDudeUuid !== dude.uuid);
        }
        dude.shootoutStatus = ShootoutStatuses.None;      
    }

    gatherPosses() {
        this.leaderPosse.forEach(dudeUuid => {
            let dude = this.leaderPlayer.findCardInPlayByUuid(dudeUuid);
            dude.moveToShootoutLocation();
        });
        this.markPosse.forEach(dudeUuid => {
            let dude = this.markPlayer.findCardInPlayByUuid(dudeUuid);
            dude.moveToShootoutLocation();
        });
    }

    breakinAndEnterin() {

    }

    draw() {

    }

    revealHands() {
        this.game.revealHands();
    }

    determineWinner() {
        this.shootoutLoseWinOrder = [];
    }

    chamberAnotherRound() {
        // TODO M2 Shootout testing - to end the shootout
        this.markPosse.forEach(dudeUuid => {
            var dude = this.markPlayer.findCardInPlayByUuid(dudeUuid);
            dude.shootoutStatus = ShootoutStatuses.None; 
        });
        this.markPosse = [];
        //

        this.queueStep(new SimpleStep(this.game, () => this.game.discardDrawHands()));
        if (!this.checkEndCondition) {
            this.queueStep(new SimpleStep(this.game, () => this.beginShootoutRound()));
        }   
    }

    announcePreDraw() {

    }

}

module.exports = Shootout;
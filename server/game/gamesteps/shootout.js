const Phase = require('./phase.js');
const RevealDrawHandPrompt = require('./revealdrawhandprompt.js');
const ContinuousPlayerOrderPrompt = require('./continuousplayerorderprompt.js');
const PickYerShooterPrompt = require('./shootout/pickyershooterprompt.js');
const ShootoutPossePrompt = require('./shootout/shootoutposseprompt.js');
const TakeYerLumpsPrompt = require('./shootout/takeyerlumpsprompt.js');
const SimpleStep = require('./simplestep.js');
const RunOrGunPrompt = require('./shootout/runorgunprompt.js');

// Pseudo phase which is not part of the main pipeline.
class Shootout extends Phase {
    constructor(game, phase, leader, mark) {
        super(game, 'Shootout');
        this.highNoonPhase = phase;
        this.leader = leader;
        this.leaderPosse = [leader.uuid];
        this.mark = mark;
        this.markPosse = [mark.uuid];
        this.leaderMarkOrder = [this.leader.controller.name, this.mark.controller.name];
        this.shootoutLoseWinOrder = [];
        this.remainingSteps = [];
        this.initialise([
            new ShootoutPossePrompt(this.game, this.leaderMarkOrder),
            new SimpleStep(this.game, () => this.gatherPosses()),
            new SimpleStep(this.game, () => this.breakinAndEnterin()),
            new SimpleStep(this, () => this.beginShootoutRound())
        ]);
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
        for(const player of this.game.getPlayers()) {
            player.phase = this.highNoonPhase;
        }
        this.game.endShootout();
        this.game.addAlert('phasestart', 'Shootout ended!');     
    }

    queueStep(step) {
        this.pipeline.queueStep(step);
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

    checkEndCondition() {
        return this.leaderPosse.length === 0 || this.markPosse.length === 0;
    }

    gatherPosses() {

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
        this.markPosse = [];

        this.queueStep(new SimpleStep(this.game, () => this.game.discardDrawHands()));
        if (!this.checkEndCondition) {
            this.queueStep(new SimpleStep(this.game, () => this.beginShootoutRound()));
        }   
    }

    announcePreDraw() {

    }

}

module.exports = Shootout;
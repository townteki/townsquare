const Phase = require('./phase.js');
const PickYerShooterPrompt = require('./shootout/pickyershooterprompt.js');
const ShootoutPossePrompt = require('./shootout/shootoutposseprompt.js');
const TakeYerLumpsPrompt = require('./shootout/takeyerlumpsprompt.js');
const SimpleStep = require('./simplestep.js');
const RunOrGunPrompt = require('./shootout/runorgunprompt.js');
const {ShootoutStatuses, BountyType} = require('../Constants');
const DrawHandPrompt = require('./shootout/drawhandprompt.js');
const ShootoutPosse = require('./shootout/shootoutposse.js');
const GameActions = require('../GameActions/index.js');
const ChooseYesNoPrompt = require('./ChooseYesNoPrompt.js');
const PlayWindow = require('./playwindow.js');
const PhaseNames = require('../Constants/PhaseNames.js');
const NullLocation = require('../nulllocation.js');

// Pseudo phase which is not part of the main pipeline.
class Shootout extends Phase {
    constructor(game, phase, leader, mark, options = { isJob: false }) {
        super(game, PhaseNames.Shootout);
        this.round = 0;
        this.highNoonPhase = phase;
        this.options = options;
        this.leader = leader;
        this.mark = mark;
        this.gamelocation = mark.gamelocation;
        this.leader.shootoutStatus = ShootoutStatuses.LeaderPosse;
        this.leaderPlayerName = this.leader.controller.name;
        this.leaderPosse = new ShootoutPosse(this, this.leaderPlayer, true);
        if(!this.isJob()) {
            this.mark.shootoutStatus = ShootoutStatuses.MarkPosse;
            this.opposingPlayerName = this.mark.controller.name;
            this.opposingPosse = new ShootoutPosse(this, this.opposingPlayer, false);
        } else if(this.mark) {
            this.mark.shootoutStatus = ShootoutStatuses.CalledOut;
        }

        this.loserCasualtiesMod = 0;
        this.jobSuccessful = null;
        this.jobUnopposed = false;
        this.winningPlayer = null;
        this.headlineUsed = false;
        this.cancelled = false;
        this.shootoutLoseWinOrder = [];
        this.remainingSteps = [];
        this.abilityRestrictions = [];
        if(!options.isSimulation) {									  
            this.initialise([
                new SimpleStep(this.game, () => this.initialiseLeaderPosse()),
                new SimpleStep(this.game, () => this.gatherLeaderPosse()),
                new SimpleStep(this.game, () => this.initialiseOpposingPosse()),
                new SimpleStep(this.game, () => this.gatherOpposingPosse()),
                new SimpleStep(this.game, () => this.raisePossesFormedEvent()),
                new SimpleStep(this.game, () => this.breakinAndEnterin()),
                new SimpleStep(this.game, () => this.beginShootoutRound())
            ]);
        }
    }

    initialiseLeaderPosse() {
        this.queueStep(new ShootoutPossePrompt(this.game, this, this.leaderPlayer));      
    }

    initialiseOpposingPosse() {
        if(this.cancelled) {
            return;
        }
        if(!this.isJob()) {
            this.queueStep(new ShootoutPossePrompt(this.game, this, this.opposingPlayer));
        } else {
            let opponent = this.leaderPlayer.getOpponent();
            if(this.game.getNumberOfPlayers() < 2) {
                this.endShootout();
            } else {
                if(this.game.getDudesInPlay(opponent, card => card.requirementsToJoinPosse().canJoin).length) {
                    this.opposingPlayerName = opponent.name;
                    if(opponent === this.game.automaton) {
                        if(this.game.automaton.decideJobOpposing(this)) {
                            this.handleJobOpposing(opponent, true);
                        } else {
                            this.handleJobOpposing(opponent, false);
                        }
                    } else {
                        this.game.queueStep(new ChooseYesNoPrompt(this.game, opponent, {
                            title: 'Do you want to oppose?',
                            onYes: () => this.handleJobOpposing(opponent, true),
                            onNo: () => this.handleJobOpposing(opponent, false),
                            promptInfo: { 
                                type: 'info', 
                                message: `Job in "${this.shootoutLocation.title}"`
                            },
                            source: this.options.jobAbility.card
                        }));
                    }
                } else {
                    this.handleJobOpposing(opponent, false, true);
                }
            }
        }
        this.leaderOpponentOrder = [this.leader.controller.name, this.opposingPlayerName];
    }

    handleJobOpposing(opponent, isOpposing, noDudesToOppose = false) {
        if(isOpposing) {
            this.opposingPosse = new ShootoutPosse(this, opponent);
            this.queueStep(new ShootoutPossePrompt(this.game, this, opponent)); 
            this.queueStep(new SimpleStep(this, () => {
                if(this.mark.getType() !== 'dude') {
                    this.mark.shootoutStatus = ShootoutStatuses.None;
                }
            }));
        } else {
            let text = noDudesToOppose ? '{0} does not have any available dudes to oppose job {1}' :
                '{0} decides to not oppose job {1}';
            this.game.addAlert('info', text, opponent, this.options.jobAbility.card);
            this.jobUnopposed = true;
            this.endShootout();
        }
    }

    raisePossesFormedEvent() {
        if(this.cancelled) {
            return;
        }
        if(!this.jobUnopposed) {
            this.game.raiseEvent('onPossesFormed', { shootout: this });
        }
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
        return this.game.findLocation(this.gamelocation) || new NullLocation();
    }   

    isJob() {
        return this.options.isJob;
    }

    resetForTheRound() {
        this.winner = null;
        this.loser = null;
        this.resetModifiers();
        if(this.leaderPosse) {
            this.leaderPosse.resetForTheRound();
        }
        if(this.opposingPosse) {
            this.opposingPosse.resetForTheRound();
        }
    }

    resetModifiers() {
        this.leaderPlayer.rankModifier = this.leaderPlayer.persistentRankModifier;
        this.leaderPlayer.casualties = 0;
        if(this.opposingPlayer) {
            this.opposingPlayer.rankModifier = this.opposingPlayer.persistentRankModifier;
            this.opposingPlayer.casualties = 0;
        }
    }

    beginShootoutRound() {
        if(this.checkEndCondition()) {
            return;
        }
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

        this.round += 1;
        this.game.raiseEvent('onShootoutRoundStarted');
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
        this.game.raiseEvent('onShootoutPhaseStarted', { shootout: this });
        let phaseName = this.isJob() ? 'Job' : 'Shootout';
        this.game.addAlert('phasestart', phaseName + ' started!');        
    }

    endPhase(isCancel = false) {
        this.game.raiseEvent('onShootoutPhaseFinished', {
            phase: this.name, 
            shootout: this,
            winner: this.winningPlayer 
        });
        this.game.currentPhase = this.highNoonPhase;
        var attackingPlayer = this.leaderPlayer;
        var defendingPlayer = this.opposingPlayer;
        attackingPlayer.phase = this.highNoonPhase;
        if(defendingPlayer) {
            defendingPlayer.phase = this.highNoonPhase;
        }

        this.actOnAllParticipants(dude => dude.shootoutStatus = ShootoutStatuses.None);
        this.leader.shootoutStatus = ShootoutStatuses.None;
        this.mark.shootoutStatus = ShootoutStatuses.None;
        this.resetModifiers();
        if(this.isJob()) {
            if(this.cancelled) {
                this.options.jobAbility.unpayCosts(this.options.jobAbility.context);
            } else {
                this.game.raiseEvent('onDudesReturnAfterJob', { job: this }, event => {
                    event.job.actOnLeaderPosse(card => {
                        if(!card.doesNotReturnAfterJob()) {
                            event.job.sendHome(card, { 
                                game: this.game, player: this.leaderPlayer 
                            }, { 
                                isCardEffect: false, isAfterJob: true 
                            });
                        }
                    });
                });
            }
            this.options.jobAbility.setResult(this.jobSuccessful, this);
            this.options.jobAbility.reset();
        }
        this.queueStep(new SimpleStep(this.game, () => {
            this.game.endShootout(isCancel);
            let phaseName = this.isJob() ? 'Job' : 'Shootout';
            this.game.addAlert('phasestart', phaseName + ' ended!'); 
        }));       
    }

    endShootout(recordStatus = true) {
        if(this.cancelled) {
            return;
        }
        if(!this.isJob()) {
            if((!this.opposingPosse || this.opposingPosse.isEmpty()) &&
                this.leaderPosse && !this.leaderPosse.isEmpty()) {
                this.winningPlayer = this.leaderPlayer;
            }
            if((!this.leaderPosse || this.leaderPosse.isEmpty()) &&
                this.opposingPosse && !this.opposingPosse.isEmpty()) {
                this.winningPlayer = this.opposingPlayer;
            }
            return;
        }
        if(recordStatus) {
            this.recordJobStatus();
        }
    }

    queueStep(step) {
        this.pipeline.queueStep(step);
    }

    getPosseByPlayer(player) {
        if(!player) {
            return;
        }
        if(player.equals(this.leaderPlayer)) {
            return this.leaderPosse;
        }
        if(player.equals(this.opposingPlayer)) {
            return this.opposingPosse;
        }
    }

    getParticipants() {
        let dudes = this.opposingPosse ? this.opposingPosse.getDudes() : [];
        return this.leaderPosse ? this.leaderPosse.getDudes().concat(dudes) : dudes;
    }

    getPosseStat(player, stat) {
        const posse = this.getPosseByPlayer(player);
        return posse ? posse.getTotalStat(stat) : 0;
    }

    isInLeaderPosse(card) {
        return this.leaderPosse && this.leaderPosse.isInPosse(card);
    }

    isInOpposingPosse(card) {
        return this.opposingPosse && this.opposingPosse.isInPosse(card);
    }

    isInShootout(card) {
        return this.isInLeaderPosse(card) || this.isInOpposingPosse(card);
    }

    isShooter(dude, checkLeader = true, checkOpposing = true) {
        return (checkLeader && this.leaderPosse && this.leaderPosse.shooter && this.leaderPosse.shooter.equals(dude)) ||
            (checkOpposing && this.opposingPosse && this.opposingPosse.shooter && this.opposingPosse.shooter.equals(dude));        
    }

    getPosseSize(player) {
        const posse = this.getPosseByPlayer(player);
        return posse ? posse.posse.length : 0;
    }

    belongsToLeaderPlayer(dude) {
        return dude.controller.name === this.leaderPlayerName;
    }

    belongsToOpposingPlayer(dude) {
        return dude.controller.name === this.opposingPlayerName;
    }

    checkEndCondition() {
        return this.cancelled || 
            !this.leaderPosse || 
            !this.opposingPosse || 
            this.leaderPosse.isEmpty() || 
            this.opposingPosse.isEmpty();
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

    sendHome(card, context, options = {}, callback = () => true) {
        let updatedOptions = Object.assign(options, { fromPosse: true });
        return this.game.resolveGameAction(GameActions.sendHome({ card: card, options: updatedOptions }), context).thenExecute(() => callback());
    }

    addToPosse(dude) {
        if(this.belongsToLeaderPlayer(dude)) {
            this.leaderPosse.addToPosse(dude);
        } else if(this.belongsToOpposingPlayer(dude)) {
            this.opposingPosse.addToPosse(dude);
        }
    }

    removeFromPosse(dude) {
        if(this.belongsToLeaderPlayer(dude) && this.leaderPosse) {
            this.leaderPosse.removeFromPosse(dude);
        } else if(this.belongsToOpposingPlayer(dude) && this.opposingPosse) {
            this.opposingPosse.removeFromPosse(dude);
        }
        if(this.jobSuccessful === null) {
            this.recordJobStatus();
        }
    }

    gatherLeaderPosse() {
        this.actOnLeaderPosse(dude => this.moveDudeToMark(dude));
    }

    gatherOpposingPosse() {
        if(!this.checkEndCondition()) {
            this.actOnOpposingPosse(dude => this.moveDudeToMark(dude));
            this.game.raiseEvent('onShootoutPossesGathered');
        }
    }

    moveDudeToMark(dude) {
        let dudeMoveOptions = dude.getMoveOptions();
        if(dudeMoveOptions.moveToPosse) {
            if(!dude.moveToShootoutLocation(dudeMoveOptions)) {
                this.removeFromPosse(dude);
            }
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
        if(!player) {
            return;
        }
        if(player.equals(this.leaderPlayer)) {
            this.actOnLeaderPosse(action, exception);
        } else if(player.equals(this.opposingPlayer)) {
            this.actOnOpposingPosse(action, exception);
        }
    }

    actOnAllParticipants(action) {
        this.actOnLeaderPosse(action);
        this.actOnOpposingPosse(action);
    }

    isBreakinAndEnterin(dude, locationCard) {
        if(this.checkEndCondition() || this.shootoutLocation.isTownSquare()) {
            return false;
        }
        const shootoutLocCard = locationCard || this.shootoutLocation.locationCard;
        if(shootoutLocCard && (shootoutLocCard.getType() === 'outfit' || shootoutLocCard.hasKeyword('private'))) {
            return !dude.options.contains('doesNotGetBountyOnJoin') && !shootoutLocCard.owner.equals(dude.controller);
        }
        return false;
    }

    breakinAndEnterin() {
        if(this.checkEndCondition() || this.shootoutLocation.isTownSquare()) {
            return;
        }
        const locationCard = this.shootoutLocation.locationCard;
        if(!locationCard.owner.equals(this.leaderPlayer)) {
            this.actOnLeaderPosse(dude => this.game.resolveGameAction(GameActions.addBounty({ 
                card: dude, 
                reason: BountyType.breaking 
            }), { game: this.game, card: dude }), 
            dude => !this.isBreakinAndEnterin(dude, locationCard));
        } else {
            this.actOnOpposingPosse(dude => this.game.resolveGameAction(GameActions.addBounty({ 
                card: dude, 
                reason: BountyType.breaking 
            }), { game: this.game, card: dude }), 
            dude => !this.isBreakinAndEnterin(dude, locationCard));
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
            this.leaderPlayer.modifyCasualties(1);
            this.opposingPlayer.modifyCasualties(1);
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
            this.loser.modifyCasualties(Math.abs(leaderRank - opposingRank));
            this.game.addMessage('{0} is the winner of this shootout by {1} ranks.', this.winner, Math.abs(leaderRank - opposingRank));
        }
        this.loser.modifyCasualties(this.loserCasualtiesMod);
        this.shootoutLoseWinOrder = [this.loser.name, this.winner.name];
    }

    casualtiesAndRunOrGun() {
        this.game.raiseEvent('onShootoutCasualtiesStepStarted', { shootoutRound: this.round });
        this.queueStep(new TakeYerLumpsPrompt(this.game, this.shootoutLoseWinOrder));
        this.queueStep(new RunOrGunPrompt(this.game, this.shootoutLoseWinOrder));
    }

    chamberAnotherRound() {
        this.queueStep(new SimpleStep(this.game, () => this.game.discardDrawHands()));
        this.game.raiseEvent('onShootoutRoundFinished');
        this.queueStep(new SimpleStep(this.game, () => {
            if(!this.checkEndCondition()) {
                this.game.addAlert('info', 'Both players Chamber another round and go to next round of shootout.');
                this.queueStep(new SimpleStep(this.game, () => this.beginShootoutRound()));
            } else {
                this.endShootout(false);
            }
        }));
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
	
    allowGameAction(actionType, context) {
        let currentAbilityContext = context || this.game.currentAbilityContext;
        return !this.abilityRestrictions.some(restriction => restriction.isMatch(actionType, currentAbilityContext, this.controller));
    }

    addAbilityRestriction(restrictions) {
        let restrArray = restrictions;
        if(!Array.isArray(restrictions)) {
            restrArray = [restrictions];
        }
        restrArray.forEach(r => this.abilityRestrictions.push(r));
    }

    removeAbilityRestriction(restrictions) {
        let restrArray = restrictions;
        if(!Array.isArray(restrictions)) {
            restrArray = [restrictions];
        }
        this.abilityRestrictions = this.abilityRestrictions.filter(r => !restrArray.includes(r));	 
    }

    getGameElementType() {
        return 'shootout';
    }

    getState() {
        let playerStats = this.game.getPlayers().map(player => {
            const posse = this.getPosseByPlayer(player);
            return {
                player: player.name,
                shooter: (posse && posse.shooter) ? posse.shooter.title : null,
                studBonus: posse ? posse.getStudBonus() : 0,
                drawBonus: posse ? posse.getDrawBonus() : 0,
                handRank: player.getTotalRank(),
                baseHandRank: player.getHandRank().rank,
                casualties: player.casualties,
                cheatinResNum: player.getOpponent().isCheatin() ? player.maxAllowedCheatin - player.numCheatinPlayed : 0
            };
        });
        const effects = this.game.effectEngine.getAppliedEffectsOnTarget(this)
            .filter(effect => effect.effect && effect.effect.title).map(effect => effect.getSummary());

        return {
            classType: 'shootout',
            effects: effects,
            round: this.round,
            playerStats
        };
    }
}

module.exports = Shootout;

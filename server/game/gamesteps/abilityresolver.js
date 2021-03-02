const BaseStep = require('./basestep.js');
const Event = require('../event');
const GamePipeline = require('../gamepipeline.js');
const SimpleStep = require('./simplestep.js');

class AbilityResolver extends BaseStep {
    constructor(game, ability, context) {
        super(game);

        this.ability = ability;
        this.context = context;
        this.pipeline = new GamePipeline();
        this.pipeline.initialise([
            new SimpleStep(game, () => this.createSnapshot()),
            new SimpleStep(game, () => this.game.pushAbilityContext(this.context)),
            new SimpleStep(game, () => this.context.resolutionStage = 'cost'),
            new SimpleStep(game, () => this.resolveCosts()),
            new SimpleStep(game, () => this.waitForCostResolution()),
            new SimpleStep(game, () => this.payCosts()),
            new SimpleStep(game, () => this.context.resolutionStage = 'effect'),
            new SimpleStep(game, () => this.choosePlayer()),
            new SimpleStep(game, () => this.waitForChoosePlayerResolution()),
            new SimpleStep(game, () => this.resolveTargets()),
            new SimpleStep(game, () => this.waitForTargetResolution()),
            new SimpleStep(game, () => this.markActionAsTaken()),
            new SimpleStep(game, () => this.executeHandler()),
            new SimpleStep(game, () => this.postResolveAbilityUpdates()),
            new SimpleStep(game, () => this.raiseOnAbilityResolvedEvent()),
            new SimpleStep(game, () => this.game.popAbilityContext())
        ]);
    }

    queueStep(step) {
        this.pipeline.queueStep(step);
    }

    isComplete() {
        return this.pipeline.length === 0;
    }

    onCardClicked(player, card) {
        return this.pipeline.handleCardClicked(player, card);
    }

    onMenuCommand(player, arg, method, promptId) {
        return this.pipeline.handleMenuCommand(player, arg, method, promptId);
    }

    cancelStep() {
        this.cancelled = true;
        this.pipeline.cancelStep();
    }

    continue() {
        try {
            return this.pipeline.continue();
        } catch(e) {
            this.game.reportError(e);

            let currentAbilityContext = this.game.currentAbilityContext;
            if(currentAbilityContext === this.context) {
                this.game.popAbilityContext();
            }

            return true;
        }
    }

    createSnapshot() {
        if(this.context.source && ['goods', 'spell', 'dude', 'action', 'deed'].includes(this.context.source.getType())) {
            this.context.cardStateWhenInitiated = this.context.source.createSnapshot();
        }
    }

    markActionAsTaken() {
        if(this.cancelled || this.ability.options.doNotMarkActionAsTaken) {
            return;
        }
        if(this.ability.isAction()) {
            this.game.markActionAsTaken(this.context);
        }
    }

    resolveCosts() {
        if(this.cancelled) {
            return;
        }

        this.canPayResults = this.ability.resolveCosts(this.context);
    }

    waitForCostResolution() {
        if(this.cancelled) {
            return;
        }

        this.cancelled = this.canPayResults.some(result => result.resolved && !result.value);

        if(!this.canPayResults.every(result => result.resolved)) {
            return false;
        }
    }

    payCosts() {
        if(this.cancelled) {
            return;
        }

        this.ability.payCosts(this.context);
    }

    choosePlayer() {
        if(this.cancelled || !this.ability.needsChoosePlayer()) {
            return;
        }

        this.playerResult = this.ability.resolvePlayer(this.context);
    }

    waitForChoosePlayerResolution() {
        if(this.cancelled || !this.playerResult) {
            return;
        }

        if(!this.playerResult.resolved) {
            return false;
        }

        if(this.playerResult.cancelled) {
            this.cancelled = true;
            if(this.ability.abilitySourceType !== 'game') {
                this.game.addAlert('danger', '{0} cancels the resolution of {1} (costs were still paid)', this.context.player, this.context.source);
            }
            return;
        }
    }

    resolveTargets() {
        if(this.cancelled) {
            return;
        }

        this.targetResults = this.ability.resolveTargets(this.context);
    }

    waitForTargetResolution() {
        if(this.cancelled) {
            return;
        }

        let cancelledTargeting = this.targetResults.some(result => result.cancelled);
        if(cancelledTargeting) {
            this.cancelled = true;
            if(this.ability.abilitySourceType !== 'game') {
                this.game.addAlert('danger', '{0} cancels the resolution of {1} (costs were still paid)', this.context.player, this.context.source);
            }
            return;
        }

        if(!this.targetResults.every(result => result.resolved)) {
            return false;
        }

        this.context.targets.setSelections(this.targetResults);

        if(this.context.targets.hasTargets()) {
            this.game.raiseEvent('onTargetsChosen', { ability: this.ability, targets: this.context.targets }, () => {
                this.context.targets.updateTargets();
                this.context.target = this.context.targets.defaultTarget;
            });
        }
    }

    executeHandler() {
        if(this.cancelled) {
            return;
        }

        this.ability.outputMessage(this.context);

        // Check to make sure the ability is actually a card ability. For
        // instance, shoppin does not count as initiating a card ability.
        if(this.ability.isCardAbility()) {
            let targets = this.context.targets.getTargets();
            this.game.raiseEvent('onCardAbilityInitiated', { player: this.context.player, source: this.context.source, ability: this.ability, targets: targets }, () => {
                if(this.ability.playTypePlayed() === 'cheatin resolution') {           
                    this.context.player.incrementCheatinResPlayed();
                }
                this.ability.executeHandler(this.context);
            });
        } else {
            this.ability.executeHandler(this.context);
        }
    }

    postResolveAbilityUpdates() {
        if(this.context.source && this.context.source.hasKeyword('headline')) {
            this.game.shootout.headlineUsed = true;
        }
    }

    raiseOnAbilityResolvedEvent() {
        // An event card is considered to be played even if it has been
        // cancelled. Raising the event here will allow forced reactions and
        // reactions to fire with the appropriate timing. There are no cards
        // with an interrupt to a card being played. If any are ever released,
        // then this event will need to wrap the execution of the entire
        // ability instead.
        if(this.ability.isPlayableActionAbility()) {
            if(this.context.source.location === 'being played') {
                this.context.source.owner.moveCard(this.context.source, this.context.source.actionPlacementLocation);
                this.context.source.resetAbilities();
            }

            let event = new Event('onCardPlayed', { 
                player: this.context.player, 
                card: this.context.source, 
                originalLocation: this.context.originalLocation,
                ability: this.ability 
            });

            this.game.resolveEvent(event);
        }
        if(this.ability.isCardAbility()) {
            this.game.raiseEvent('onCardAbilityResolved', { ability: this.ability, context: this.context });
        }
    }
}

module.exports = AbilityResolver;

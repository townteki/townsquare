const BaseStep = require('./basestep.js');
const GamePipeline = require('../gamepipeline.js');
const SimpleStep = require('./simplestep.js');
const ReactionBeforeWindow = require('./ReactionBeforeWindow');

class EventWindow extends BaseStep {
    constructor(game, event, postHandlerFunc = () => true) {
        super(game);

        this.event = event;
        this.pipeline = new GamePipeline();
        this.pipeline.initialise([
            new ReactionBeforeWindow(game, event, postHandlerFunc),
            new SimpleStep(game, () => this.emitBaseEvent()),
            new SimpleStep(game, () => this.openAbilityWindow('traitreaction')),
            new SimpleStep(game, () => this.openAbilityWindow('reaction')),
            new SimpleStep(game, () => this.postHandlerFunc())
        ]);
        this.postHandlerFunc = postHandlerFunc;
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
        this.pipeline.cancelStep();
    }

    continue() {
        return this.pipeline.continue();
    }

    openAbilityWindow(abilityType) {
        if(this.event.cancelled) {
            return;
        }

        this.game.openAbilityWindow({
            abilityType: abilityType,
            event: this.event
        });
    }

    emitBaseEvent() {
        if(this.event.cancelled) {
            return;
        }

        this.event.emitTo(this.game);
    }
}

module.exports = EventWindow;

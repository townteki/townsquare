const BaseStep = require('./basestep.js');
const GamePipeline = require('../gamepipeline.js');
const SimpleStep = require('./simplestep.js');

class InterruptWindow extends BaseStep {
    constructor(game, event, postHandlerFunc = () => true) {
        super(game);

        this.event = event;
        this.pipeline = new GamePipeline();
        this.pipeline.initialise([
            new SimpleStep(game, () => this.executeBeforeHandlers()),
            new SimpleStep(game, () => this.openAbilityWindow('cancelinterrupt')),
            new SimpleStep(game, () => this.automaticSave()),
            new SimpleStep(game, () => this.openAbilityWindow('forcedinterrupt')),
            new SimpleStep(game, () => this.openAbilityWindow('interrupt')),
            new SimpleStep(game, () => this.executeHandler()),
            new SimpleStep(game, () => this.openWindowForAttachedEvents()),
            new SimpleStep(game, () => this.executePostHandler())
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

    automaticSave() {
        if(this.event.cancelled) {
            return;
        }

        /* TODO M2 here add saves if any
        for(let event of this.event.getConcurrentEvents()) {
            if(event.allowAutomaticSave()) {
                event.cancel();
            }
        }
        */
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

    executeHandler() {
        if(this.event.cancelled) {
            return;
        }

        this.event.executeHandler();
    }

    openWindowForAttachedEvents() {
        if(this.event.cancelled) {
            return;
        }

        this.game.openInterruptWindowForAttachedEvents(this.event);
    }

    executePostHandler() {
        if(this.event.cancelled) {
            return;
        }

        this.event.executePostHandler();
        this.postHandlerFunc();
    }

    executeBeforeHandlers() {
        let handlers = this.game.beforeEventHandlers[this.event.name];
        if(handlers && handlers.length > 0) {
            handlers.forEach(handler => {
                if(!handler.toRemove && handler.condition(this.event)) {
                    handler.handler(this.event);
                    if(handler.useOnce) {
                        handler.toRemove = true;
                    }
                }
            });
            this.game.beforeEventHandlers[this.event.name] = handlers.filter(handler => !handler.toRemove);
        }
    }
}

module.exports = InterruptWindow;

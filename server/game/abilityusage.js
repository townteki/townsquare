class AbilityUsage {
    static createDefault() {
        return new AbilityUsage({ limit: 0, repeatable: true });
    }

    constructor(properties, playType = []) {
        this.limit = properties.limit;
        this.repeatable = !!properties.repeatable;
        if(!this.limit) {
            if(this.repeatable) {
                this.limit = 0;
            } else {
                this.limit = 1;
            } 
        }
        this.useCount = 0;
        this.resetHandler = () => this.reset();
        var isShootoutType = ['shootout', 'shootout:join', 'resolution'].some(type => playType.includes(type));
        if(isShootoutType && this.repeatable) {
            this.eventName = 'onShootoutPhaseFinished';
        } else {
            this.eventName = 'onRoundEnded';
        }
    }

    isRepeatable() {
        return this.repeatable;
    }

    isUsed() {
        if(this.limit > 0) {
            return this.useCount >= this.limit;
        }
        return !this.isRepeatable();
    }

    increment() {
        this.useCount += 1;
    }

    reset() {
        this.useCount = 0;
    }

    registerEvents(eventEmitter, eventName) {
        this.eventName = eventName || this.eventName;
        eventEmitter.on(this.eventName, this.resetHandler);
    }

    unregisterEvents(eventEmitter) {
        eventEmitter.removeListener(this.eventName, this.resetHandler);
        this.reset();
    }
}

module.exports = AbilityUsage;

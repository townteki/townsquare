class NullEvent {
    constructor() {
        this.attachedEvents = [];
        this.cancelled = false;
    }

    get resolved() {
        return false;
    }

    addChildEvent() {
    }

    emitTo() {
    }

    cancel() {
        this.cancelled = true;
    }

    replaceHandler() {
    }

    executeHandler() {
    }

    executePostHandler() {
    }

    getConcurrentEvents() {
        return [this];
    }

    getPrimaryEvent() {
        return this;
    }

    thenAttachEvent() {
    }

    thenExecute() {
        return this;
    }

    clearAttachedEvents() {
    }

    isNull() {
        return true;
    }
}

module.exports = NullEvent;

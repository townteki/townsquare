/** @typedef {import('../game')} Game */
class BaseStep {
    constructor(game) {
        /** @type {Game} */
        this.game = game;
    }

    continue() {
    }

    onCardClicked() {
        return false;
    }

    onMenuCommand() {
        return false;
    }

    isCorrectPrompt() {
        return true;
    }

    clearSelectedCards() {
    }

    getDebugInfo() {
        return this.constructor.name;
    }
}

module.exports = BaseStep;

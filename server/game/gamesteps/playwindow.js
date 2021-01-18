const ContinuousPlayerOrderPrompt = require('./continuousplayerorderprompt.js');

class PlayWindow extends ContinuousPlayerOrderPrompt {

    constructor(game, name, activePromptTitle, playerNameOrder = [], buttonFunctions = {}) {
        super(game, activePromptTitle, playerNameOrder, buttonFunctions);
        this.name = name;
        this.eventRaised = false;
    }

    continue() {
        let result = super.continue();

        if(!this.isComplete()) {
            if (!this.eventRaised) {
                this.game.currentPlayWindow = this;
                this.eventRaised = true;
                this.game.raiseEvent('onPlayWindowOpened', { playWindow: this });
            }
        } else {
            this.game.currentPlayWindow = null;
            this.game.raiseEvent('onPlayWindowClosed', { playWindow: this });
        }

        return result;
    }

    markActionAsTaken(player) {
        this.onDone(player);
    }

}

module.exports = PlayWindow;

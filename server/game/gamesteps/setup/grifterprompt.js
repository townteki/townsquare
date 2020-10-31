const ReadyPrompt = require('../readyprompt.js');

class GrifterPrompt extends ReadyPrompt {
    completionCondition() {
        return this.done;
    }

    activePrompt() {
        return {
            menuTitle: 'Ready/Grifter?',
            buttons: [
                { arg: 'selected', text: 'Play Lowball' }
            ]
        };
    }

    onMenuCommand(player) {
        this.done = true;
        this.game.addMessage('{0} is ready to play', player);
    }
}

module.exports = GrifterPrompt;

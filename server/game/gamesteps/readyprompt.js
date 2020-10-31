const AllPlayerPrompt = require('./allplayerprompt.js');

class ReadyPrompt extends AllPlayerPrompt {
    completionCondition() {
        return this.done;
    }

    activePrompt() {
        return {
            menuTitle: 'Ready?',
            buttons: [
                { arg: 'selected', text: 'Done' }
            ]
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent...' };
    }

    onMenuCommand() {
        this.done = true;
        //this.game.addMessage('{0} is ready to move on', player);
    }
}

module.exports = ReadyPrompt;

const AllPlayerPrompt = require('../allplayerprompt.js');

class SundownPrompt extends AllPlayerPrompt {
    completionCondition(player) {
        return player.passTurn;
    }

    activePrompt() {
        return {
            menuTitle: 'Ready for Lowball?',
            buttons: [
                { arg: 'selected', text: 'Ready' }
            ]
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent...' };
    }

    onMenuCommand(player) {
        player.passTurn = true;
    }
}

module.exports = SundownPrompt;

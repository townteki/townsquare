const AllPlayerPrompt = require('../allplayerprompt.js');

class StartingPossePrompt extends AllPlayerPrompt {
    completionCondition(player) {
        return player.posse;
    }

    activePrompt() {
        return {
            menuTitle: 'Select Starting Posse',
            buttons: [
                { arg: 'selected', text: 'Done' }
            ]
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to select starting posse' };
    }

    onMenuCommand(player) {
        player.startPosse();
        this.game.addMessage('{0} has rounded up their starting posse', player);
    }
}

module.exports = StartingPossePrompt;

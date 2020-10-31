const AllPlayerPrompt = require('../allplayerprompt.js');

class UpkeepPrompt extends AllPlayerPrompt {
    completionCondition(player) {
        return player.upkeepPaid;
    }

    activePrompt() {
        return {
            menuTitle: 'Discard Unwanted Cards with Upkeep',
            buttons: [
                { arg: 'selected', text: 'Done' }
            ]
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to pay upkeep' };
    }

    onMenuCommand(player) {
        let upkeep = player.payUpkeep();
        this.game.addMessage('{0} has paid upkeep of {1} GR', player, upkeep);
    }
}

module.exports = UpkeepPrompt;

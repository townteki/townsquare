const AllPlayerPrompt = require('../allplayerprompt.js');

class UpkeepPrompt extends AllPlayerPrompt {
    constructor(game) {
        super(game);
        this.title = 'Discard Unwanted Cards with Upkeep';
    }

    completionCondition(player) {
        return player.upkeepPaid;
    }

    activePrompt() {
        return {
            menuTitle: this.title,
            buttons: [
                { arg: 'selected', text: 'Done' }
            ]
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to pay upkeep' };
    }

    onMenuCommand(player) {
        let upkeep = player.determineUpkeep();
        let difference = upkeep - player.ghostrock;
        if(difference > 0) {
            this.title = 'Discard Cards to pay Upkeep (' + difference + ' remaining)';
        } else {
            player.payUpkeep(upkeep);
            this.game.addMessage('{0} has paid upkeep of {1} GR', player, upkeep);
        }
    }
}

module.exports = UpkeepPrompt;

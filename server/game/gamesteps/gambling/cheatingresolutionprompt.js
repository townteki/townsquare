const PlayerOrderPrompt = require('../playerorderprompt.js');

class CheatingResolutionPrompt extends PlayerOrderPrompt {
    activeCondition(player) {
        return super.activeCondition(player) && player.getOpponent().isCheatin();
    }

    activePrompt() {
        return {
            menuTitle: 'Play Cheatin\' Resolution?',
            buttons: [
                { arg: 'selected', text: 'Pass' }
            ]
        };
    }

    skipCondition(player) {
        return !player.getOpponent().isCheatin();
    }

    onMenuCommand(player) {
        if(player !== this.currentPlayer) {
            return false;
        }

        this.completePlayer();
    }
}

module.exports = CheatingResolutionPrompt;

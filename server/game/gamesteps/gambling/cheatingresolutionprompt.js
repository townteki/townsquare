const PlayerOrderPrompt = require('../playerorderprompt.js');

class CheatingResolutionPrompt extends PlayerOrderPrompt {
    activePrompt() {
        return {
            menuTitle: 'Play Cheatin\' Resolution?',
            buttons: [
                { arg: 'selected', text: 'Pass' }
            ]
        };
    }

    onMenuCommand(player) {
        if(player !== this.currentPlayer) {
            return false;
        }

        this.completePlayer();
    }
}

module.exports = CheatingResolutionPrompt;

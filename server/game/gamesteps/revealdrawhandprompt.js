const _ = require('underscore');
const AllPlayerPrompt = require('./allplayerprompt.js');

class RevealDrawHandPrompt extends AllPlayerPrompt {
    completionCondition(player) {
        return player.drawHandSelected;
    }

    activePrompt() {
        return {
            menuTitle: 'Reveal draw hand?',
            buttons: [
                { arg: 'revealdraw', text: 'Ready' }
            ]
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to reveal draw hand' };
    }

    onMenuCommand(player) {
        
        //If Draw Hand > 5, Return
    
        player.drawHandSelected = true;
    
        this.game.addMessage('{0} is ready to reveal their draw hand', player);
    }

    //continue() {
    //    this.revealHands();
    //}

    revealHands() {            
        _.each(this.game.getPlayers(), player => {
            player.revealDrawHand();            
        });
    }
}

module.exports = RevealDrawHandPrompt;

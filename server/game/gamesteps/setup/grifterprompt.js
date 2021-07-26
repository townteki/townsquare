const ReadyPrompt = require('../readyprompt.js');

class GrifterPrompt extends ReadyPrompt {
    completionCondition(player) {
        return this.done || 
            !player.cardsInPlay.some(card => 
                card.getType() === 'dude' && 
                card.hasKeyword('grifter') &&
                !card.isScripted());
    }

    activePrompt() {
        return {
            menuTitle: 'Use unscripted Grifter?',
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

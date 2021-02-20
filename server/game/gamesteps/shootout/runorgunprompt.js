const PlayerOrderPrompt = require('../playerorderprompt.js');

class RunOrGunPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
    } 

    continue() {
        if(this.isComplete()) {
            return true;
        }
        if(this.shootout.getPosseByPlayer(this.currentPlayer).isEmpty()) {
            this.completePlayer();
            return this.continue();
        }

        this.game.promptForSelect(this.currentPlayer, {
            activePromptTitle: 'Select dudes to flee the shootout',
            multiSelect: true,
            numCards: 0,
            additionalButtons: [
                { text: 'All dudes run', arg: 'allrun' }
            ],
            cardCondition: card => card.controller === this.currentPlayer &&
                card.location === 'play area' &&
                card.getType() === 'dude' &&
                this.shootout.isInShootout(card),
            onSelect: (player, cards) => {
                cards.forEach(card => this.shootout.sendHome(card, { isCardEffect: false }));
                this.completePlayer();
                return true;
            },
            onCancel: () => {
                this.completePlayer();
                return true;
            },
            onMenuCommand: (player) => {
                this.shootout.actOnPlayerPosse(player, card => this.shootout.sendHome(card, { isCardEffect: false }));
                this.completePlayer();
                return true;
            }
        });

        return false;        
    }
}

module.exports = RunOrGunPrompt;

const ShootoutOrderPrompt = require('./shootoutorderprompt.js');

class RunOrGunPrompt extends ShootoutOrderPrompt {
    continue() {
        if(this.isComplete()) {
            return true;
        }
        const context = { game: this.game, player: this.currentPlayer };
        const currentPlayerPosse = this.game.shootout.getPosseByPlayer(this.currentPlayer);
        if(currentPlayerPosse.isEmpty() || this.currentPlayer.dudesCannotFlee() ||
            currentPlayerPosse.getDudes().every(dude => (dude.cannotFlee() || !dude.allowGameAction('sendHome', context)))) {
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
            cardCondition: card => 
                this.game.shootout &&
                card.controller === this.currentPlayer &&
                card.location === 'play area' &&
                card.getType() === 'dude' &&
                !card.cannotFlee() &&
                this.game.shootout.isInShootout(card) &&
                card.allowGameAction('removeFromPosse', context) &&
                (card.isAtHome() || card.allowGameAction('moveDude', context)),
            onSelect: (player, cards) => {
                cards.forEach(card => this.game.shootout.sendHome(
                    card, 
                    { game: this.game, player: this.currentPlayer },
                    { isCardEffect: false }
                ));
                this.completePlayer();
                return true;
            },
            onCancel: () => {
                this.completePlayer();
                return true;
            },
            onMenuCommand: (player) => {
                this.game.shootout.actOnPlayerPosse(player, card => this.game.shootout.sendHome(
                    card, 
                    { game: this.game, player: this.currentPlayer },
                    { isCardEffect: false }
                ));
                this.completePlayer();
                return true;
            }
        });

        return false;        
    }
}

module.exports = RunOrGunPrompt;

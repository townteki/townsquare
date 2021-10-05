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
        const context = { game: this.game, player: this.currentPlayer };
        const options = { isCardEffect: false };
        const currentPlayerPosse = this.shootout.getPosseByPlayer(this.currentPlayer);
        if(currentPlayerPosse.isEmpty() || this.currentPlayer.dudesCannotFlee() ||
            currentPlayerPosse.getDudes().every(dude => (dude.cannotFlee() || !dude.allowGameAction('sendHome', context, options)))) {
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
                !card.cannotFlee() &&
                this.shootout.isInShootout(card) &&
                card.allowGameAction('removeFromPosse', context, options) &&
                (card.isAtHome() || card.allowGameAction('moveDude', context, options)),
            onSelect: (player, cards) => {
                cards.forEach(card => this.shootout.sendHome(
                    card, 
                    context,
                    options
                ));
                this.completePlayer();
                return true;
            },
            onCancel: () => {
                this.completePlayer();
                return true;
            },
            onMenuCommand: (player) => {
                this.shootout.actOnPlayerPosse(player, card => {
                    if(!card.cannotFlee()) {
                        this.shootout.sendHome(card, context, options);
                    }
                });
                this.completePlayer();
                return true;
            }
        });

        return false;        
    }
}

module.exports = RunOrGunPrompt;

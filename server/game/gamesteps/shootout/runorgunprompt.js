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
        const options = { isCardEffect: false, reason: 'fleeing' };
        const currentPlayerPosse = this.shootout.getPosseByPlayer(this.currentPlayer);
        if(currentPlayerPosse.isEmpty() || this.currentPlayer.dudesCannotFlee() ||
            currentPlayerPosse.getDudes().every(dude => (dude.cannotFlee() || !dude.allowGameAction('sendHome', context, options)))) {
            this.completePlayer();
            return this.continue();
        }

        if(this.currentPlayer === this.game.automaton) {
            this.handleSolo(context, options);
            this.completePlayer();
            return this.continue();
        }
        this.runOrGun(context, options);

        return false;        
    }

    runOrGun(context, options) {
        this.game.promptForSelect(this.currentPlayer, {
            activePromptTitle: 'Select dudes to flee the shootout',
            multiSelect: true,
            numCards: 0,
            additionalButtons: [
                { text: 'All dudes run', arg: 'allrun' }
            ],
            cardCondition: card => card.controller.equals(this.currentPlayer) &&
                card.location === 'play area' &&
                this.canFleeFromShootout(card, context, options),
            onSelect: (player, cards) => {
                this.flee(cards, context, options);
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
    }

    canFleeFromShootout(card, context, options) {
        return card.getType() === 'dude' &&
            !card.cannotFlee() &&
            this.shootout.isInShootout(card) &&
            card.allowGameAction('removeFromPosse', context, options) &&
            (card.isAtHome() || card.allowGameAction('moveDude', context, options));
    }

    handleSolo(context, options) {
        const dudesThatCanFlee = this.game.automaton.cardsInPlay.filter(card =>
            this.canFleeFromShootout(card, context, options));
        const fleeingDudes = this.game.automaton.getDudesToFlee(dudesThatCanFlee);
        this.flee(fleeingDudes, context, options);
    }

    flee(cards, context, options) {
        cards.forEach(card => this.shootout.sendHome(
            card, 
            context,
            options
        ));
    }
}

module.exports = RunOrGunPrompt;

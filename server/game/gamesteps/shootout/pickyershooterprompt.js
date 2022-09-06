const PlayerOrderPrompt = require('../playerorderprompt.js');

class PickYerShooterPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
    } 

    continue() {
        if(!this.isComplete()) {
            this.game.raiseEvent('onShooterToBePicked', { player: this.currentPlayer });
            const availableDudes = this.currentPlayer.cardsInPlay.filter(card => 
                card.getType() === 'dude' && 
                this.shootout.isInShootout(card) &&
                !card.cannotBePickedAsShooter());
            if(this.currentPlayer.equals(this.game.automaton)) {
                const shooter = this.game.automaton.pickShooter(availableDudes);
                this.pickShooter(this.game.automaton, shooter);
            } else {
                this.game.promptForSelect(this.currentPlayer, {
                    activePromptTitle: 'Select Yer Shooter',
                    autoSelect: true,
                    cardCondition: card => availableDudes.includes(card),
                    onSelect: (player, card) => {
                        this.pickShooter(player, card);
                        return true;
                    }
                });
            }
        }

        return this.isComplete();        
    }

    pickShooter(player, shooter) {
        this.game.raiseEvent('onShooterPicked', { card: shooter, player: player }, event => {
            this.shootout.pickShooter(event.card);
            this.game.addMessage('{0} picks {1} as shooter', event.player, event.card);
        });
        this.completePlayer();
    }
}

module.exports = PickYerShooterPrompt;

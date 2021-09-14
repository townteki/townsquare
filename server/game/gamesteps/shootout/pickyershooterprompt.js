const ShootoutOrderPrompt = require('./shootoutorderprompt.js');

class PickYerShooterPrompt extends ShootoutOrderPrompt {
    continue() {
        if(!this.isComplete()) {
            this.game.raiseEvent('onShooterToBePicked', { player: this.currentPlayer });
            this.game.promptForSelect(this.currentPlayer, {
                activePromptTitle: 'Select Yer Shooter',
                autoSelect: true,
                cardCondition: card => this.game.shootout && 
                    card.getType() === 'dude' && 
                    card.location === 'play area' &&
                    this.game.shootout.isInShootout(card) &&
                    card.controller === this.currentPlayer &&
                    !card.cannotBePickedAsShooter(),
                onSelect: (player, card) => {
                    this.game.raiseEvent('onShooterPicked', { card: card, player: player }, event => {
                        this.game.shootout.pickShooter(event.card);
                        this.game.addMessage('{0} picks {1} as shooter', event.player, event.card);
                    });
                    this.completePlayer();
                    return true;
                }
            });
        }

        return this.isComplete();        
    }
}

module.exports = PickYerShooterPrompt;

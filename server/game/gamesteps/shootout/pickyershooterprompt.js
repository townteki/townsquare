const PlayerOrderPrompt = require('../playerorderprompt.js');

class PickYerShooterPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
    } 

    continue() {
        if(!this.isComplete()) {
            this.game.promptForSelect(this.currentPlayer, {
                activePromptTitle: 'Select Yer Shooter',
                autoSelect: true,
                cardCondition: card => card.getType() === 'dude' && 
                    card.location === 'play area' &&
                    this.shootout.isInShootout(card) &&
                    card.controller === this.currentPlayer &&
                    !card.cannotBePickedAsShooter(),
                onSelect: (player, card) => {
                    this.game.raiseEvent('onShooterPicked', { card: card, player: player }, event => {
                        this.shootout.pickShooter(event.card);
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

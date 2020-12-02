const { ShootoutStatuses } = require('../../Constants/index.js');
const PlayerOrderPrompt = require('../playerorderprompt.js');

class PickYerShooterPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
    } 

    continue() {
        if (!this.isComplete()) {
            this.game.promptForSelect(this.currentPlayer, {
                activePromptTitle: 'Select Yer Shooter',
                autoSelect: true,
                cardCondition: card => card.getType() === 'dude' && 
                    this.shootout.isInShootout(card) &&
                    card.controller === this.currentPlayer,
                onSelect: (player, card) => {
                    this.shootout.pickShooter(card);
                    this.game.addMessage('{0} picks {1} as shooter.', this.owner, card);
                    this.completePlayer();
                    return true;
                }
            });
        }

        return this.isComplete();        
    }

}

module.exports = PickYerShooterPrompt;

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
                cardCondition: card => card.getType() === 'dude' && 
                    this.shootout.isDudeInShootout(card) &&
                    card.controller === this.currentPlayer,
                onSelect: (player, card) => {
                    if (player === this.shootout.leaderPlayer) {
                        this.shootout.leaderShooter = card;
                        card.shootoutStatus = ShootoutStatuses.LeaderShooter;
                    }
                    if (player === this.shootout.markPlayer) {
                        this.shootout.markShooter = card;
                        card.shootoutStatus = ShootoutStatuses.MarkShooter;
                    }
                    this.completePlayer();
                    return true;
                }
            });
        }

        return this.isComplete();        
    }

}

module.exports = PickYerShooterPrompt;

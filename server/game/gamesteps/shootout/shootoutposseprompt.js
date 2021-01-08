const GameActions = require('../../GameActions/index.js');
const UiPrompt = require('../uiprompt.js');

class ShootoutPossePrompt extends UiPrompt {
    constructor(game, shootout, player) {
        super(game);
        this.shootout = shootout;
        this.player = player;
    }  

    continue() {
        if (!this.isComplete()) {
            this.game.promptForSelect(this.player, {
                activePromptTitle: 'Select dudes to join posse',
                multiSelect: true,
                numCards: 0,
                cardCondition: card => card.getType() === 'dude' && 
                    card.location === 'play area' &&
                    card.controller === this.player &&
                    (card !== this.shootout.mark || this.shootout.isJob()) &&
                    card !== this.shootout.leader &&
                    card.requirementsToJoinPosse().canJoin,
                onSelect: (player, dudeSelection) => {
                    //Do not move to posse yet, it will be done once both posses are selected (Shootout.gatherPosses())
                    dudeSelection.forEach(dude => 
                        this.game.resolveGameAction(GameActions.joinPosse({ card: dude, options: { isCardEffect: false, moveToPosse: false } }))
                    );
                    if (this.shootout.leaderPlayer === player) {
                        this.game.raiseEvent('onLeaderPosseFormed', { shootout: this.shootout });
                        this.game.addMessage('{0} with {1} as leader forms their posse including dudes: {2}.', player, this.shootout.leader, dudeSelection);
                    } else {
                        if (!this.shootout.isJob()) {
                            this.game.addMessage('{0} with {1} as mark forms their posse including dudes: {2}.', player, this.shootout.mark, dudeSelection);   
                        } else {
                            this.game.addMessage('{0} is opposing a job marking {1} and forms their posse including dudes: {2}.', player, this.shootout.mark, dudeSelection); 
                        }
                    }                 
                    this.complete();                 
                    return true;
                },
                onCancel: () => {
                    this.complete();
                    return true;
                }
            });
        }
        return this.isComplete();
    }

}

module.exports = ShootoutPossePrompt;

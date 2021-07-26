const ActionCard = require('../../actioncard.js');

class YouHadOneJob extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout',
            target: {
                cardCondition: card => card.location === 'play area' && card.isWanted() && card.bounty >= 3
                cardType: 'dude'
            },
            handler: context => {
                this.game.this.game.promptForSelect(player, {
                    activePromptTitle: 'Select a card',
                    waitingPromptTitle: 'Waiting for opponent to select card',
                    cardCondition: card => true,
                    cardType: 'dude',
                    onSelect: (player, card) => {
                        
                        return true;
                    }
                });
            }
            }
        });
    }
}

YouHadOneJob.code = '19042';

module.exports = YouHadOneJob;

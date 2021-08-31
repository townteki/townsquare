const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class ElectionDaySlaughter extends ActionCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Election Day Slaughter',
            playType: 'noon',
            cost: ability.costs.bootLeader(),
            target: 'townsquare',
            message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            handler: context => {
                const opponent = context.player.getOpponent();
                this.game.promptForSelect(opponent, {
                    activePromptTitle: 'Select a dude to unboot',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' && card.controller === opponent && !card.locationCard.isOutOfTown(),
                    cardType: 'dude',
                    gameAction: 'unboot',
                    onSelect: (player, card) => {
                        this.game.resolveGameAction(GameActions.unbootCard({ card }), context).thenExecute(() => {
                            this.game.addMessage('{0} unboots {1} in town as a preparation for {2}', player, card, this);
                        });
                        return true;
                    },
                    onCancel: player => {
                        this.game.addMessage('{0} does not unboot any dudes in town as a preparation for {1}', player, this);
                    },
                    source: this
                });
            },
            onSuccess: (job, context) => {
                const opponent = context.player.getOpponent();
                this.game.promptForSelect(opponent, {
                    activePromptTitle: 'Select a dude to ace',
                    waitingPromptTitle: 'Waiting for opponent to select dude',
                    cardCondition: card => card.location === 'play area' && card.controller === opponent && !card.locationCard.isOutOfTown(),
                    cardType: 'dude',
                    gameAction: 'ace',
                    numCards: 1,
                    mode: 'exactly',
                    onSelect: (player, cards) => {
                        this.game.resolveGameAction(GameActions.aceCard({ card: cards[0] }), context).thenExecute(() => {
                            this.game.addMessage('{0} aces {1} in town as a result of {2}', player, cards[0], this);
                        });
                        return true;
                    },
                    source: this
                });                
            }
        });
    }
}

ElectionDaySlaughter.code = '04021';

module.exports = ElectionDaySlaughter;

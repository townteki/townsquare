const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class LawDogs extends OutfitCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Law Dogs',
            playType: 'noon',
            cost: ability.costs.bootSelf(),        
            target: {
                activePromptTitle: 'Select dude to raise bounty',
                cardCondition: { location: 'play area' },
                cardType: 'dude'
            },
            handler: context => {
                let promptTitle = 'Select dudes with combined influence greater than ' + context.target.title + ' (' + context.target.influence + ')';
                this.game.promptForSelect(context.player, {
                    activePromptTitle: promptTitle,
                    waitingPromptTitle: 'Waiting for opponent to select dudes',
                    cardCondition: card => card.location === 'play area' && card.controller === context.player,
                    cardType: 'dude',
                    multiSelect: true,
                    numCards: 0,
                    onSelect: (player, cards) => {
                        let totalInf = cards.reduce(((memo, card) => memo += card.influence), 0);
                        if(totalInf <= context.target.influence) {
                            return false;
                        }
                        let action = GameActions.simultaneously(
                            cards.map(card => GameActions.bootCard({ card: card }))
                        );
                        this.game.resolveGameAction(action, context).thenExecute(() => 
                            this.game.resolveGameAction(GameActions.addBounty({ card: context.target })), context);
                        this.game.addMessage('{0} uses {1} to raise bounty on {2}.', player, this, context.target);
                        return true;
                    }
                });
            },
            source: this
        });
    }
}

LawDogs.code = '01002';

module.exports = LawDogs;

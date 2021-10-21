const GameAction = require('./GameAction');

class RevealTopCards extends GameAction {
    constructor() {
        super('revealTopCards');
    }

    canChangeGameState({ player, amount, context }) {
        return amount > 0 && context.game.getPlayers().includes(player);
    }

    createEvent({ player, context, amount = 1, properties }) {
        properties = this.defaultProperties(properties);
        const actualAmount = Math.min(amount, player.drawDeck.length);
        if(actualAmount < amount) {
            const savedCards = [...player.drawDeck];
            player.drawDeck = [];
            player.shuffleDiscardToDrawDeck();
            player.drawDeck = savedCards.concat(player.drawDeck);
        }
        const topCards = player.drawDeck.slice(0, amount);
        const revealFunc = card => topCards.includes(card);        
        const revealEvent = this.event('onCardsRevealed', { player, topCards, context }, event => {
            event.context.game.addMessage('{0} uses {1} to reveal top 5 cards of their deck: {2}', 
                event.player, event.context.source, event.topCards);
            const possibleCards = event.topCards.filter(card => properties.selectCondition(card));
            if(possibleCards.length > 0) {
                event.context.game.cardVisibility.addRule(revealFunc);            
                context.game.promptForSelect(event.player, {
                    activePromptTitle: properties.activePromptTitle,
                    source: context.source,
                    revealTargets: true,
                    cardCondition: card => possibleCards.includes(card),
                    numCards: properties.numCards,
                    multiSelect: true,
                    additionalButtons: properties.additionalButtons,
                    onSelect: (player, cards) => {
                        event.selectedCards = cards;
                        if(properties.onSelect) {
                            properties.onSelect(player, cards);
                            return true;
                        }
                        return false;
                    },
                    onMenuCommand: properties.onMenuCommand
                });
            }
        });
        revealEvent.thenExecute(event => {
            event.context.game.cardVisibility.removeRule(revealFunc);
        });
        return revealEvent;
    }

    defaultProperties(properties) {
        let defaultProperties = {
            activePromptTitle: 'Revealed cards',
            additionalButtons: [],
            selectCondition: () => true,
            onMenuCommand: () => true
        };
        return Object.assign(defaultProperties, properties);
    }
}

module.exports = new RevealTopCards();

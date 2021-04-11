const GameAction = require('./GameAction');

class LookAtHand extends GameAction {
    constructor() {
        super('lookAtHand');
    }

    canChangeGameState({ opponent }) {
        return opponent && opponent.hand.length > 0;
    }

    createEvent({ player, opponent, title, numToShow, numToSelect, condition, onSelect, onCancel, context }) {
        let params = {
            title: title || `Look at ${opponent.name}'s hand`,
            numToShow: numToShow || opponent.hand.length,
            numToSelect: numToSelect || 1,
            condition: condition || (() => true),
            onSelect: onSelect || (() => true),
            onCancel: onCancel || (() => true)
        };
        if(params.numToShow > opponent.hand.length) {
            params.numToShow = opponent.hand.length;
        }
        let workHand = opponent.hand;
        const cardsToLook = [];
        while(cardsToLook.length < params.numToShow && workHand.length > 0) {
            let selectedCard = workHand[Math.floor(Math.random() * (workHand.length - 1))];
            workHand = workHand.filter(card => card !== selectedCard);
            cardsToLook.push(selectedCard);
        }
        return this.event('onLookAtHand', { player, opponent }, event => {
            const revealFunc = card => cardsToLook.includes(card);
            context.game.cardVisibility.addRule(revealFunc);
            context.game.promptForSelect(event.player, {
                activePromptTitle: params.title,
                source: context.source,
                multiSelect: true,
                numCards: params.numToSelect,
                cardCondition: card => card.location === 'hand' && 
                    card.controller === event.opponent && 
                    context.game.isCardVisible(card, event.player) &&
                    params.condition(card),
                onSelect: (player, cards) => {
                    params.onSelect(player, cards);
                    return true;
                },
                onCancel: player => params.onCancel(player)
            });
            context.game.queueSimpleStep(() => {
                context.game.cardVisibility.removeRule(revealFunc);
            });
        });
    }
}

module.exports = new LookAtHand();

"use strict";

/**
 * Creates a clone of the existing deck with full card data filled in instead of
 * just card codes.
 *
 * @param {object} deck
 * @param {object} data
 * @param {object} data.cards - an index of card code to full card object
 * @param {object} data.factions - an index of faction code to full faction object
 */
function formatDeckAsFullCards(deck, data) {
    var newDeck = {
        _id: deck._id,
        name: deck.name,
        username: deck.username,
        lastUpdated: deck.lastUpdated,
        outfit: Object.assign({}, deck.outfit)
    };
	
    newDeck.outfit = data.cards[deck.outfit.code];

    if (deck.legend) {
        newDeck.legend = data.cards[deck.legend.code];
    }

    newDeck.drawCards = processCardCounts(deck.drawCards || [], data.cards);

    return newDeck;
}

function processCardCounts(cardCounts, cardData) {
    var cardCountsWithData = cardCounts.map(function (cardCount) {
        return { count: cardCount.count, card: cardCount.card.custom ? cardCount.card : cardData[cardCount.card.code], starting: cardCount.starting };
    });

    // Filter out any cards that aren't available in the card data.
    return cardCountsWithData.filter(function (cardCount) {
        return !!cardCount.card;
    });
}

module.exports = formatDeckAsFullCards;
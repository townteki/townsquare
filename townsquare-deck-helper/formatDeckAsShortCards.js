"use strict";

/**
 * Creates a clone of the existing deck with only card codes instead of full
 * card data.
 */
function formatDeckAsShortCards(deck) {
    var newDeck = {
        _id: deck._id,
        name: deck.name,
        username: deck.username,
        lastUpdated: deck.lastUpdated,
        outfit: { code: deck.outfit.code, title: deck.outfit.title, gang_code: deck.outfit.gang_code, pack_code: deck.outfit.pack_code }
    };

    if (deck.legend) {
        newDeck.legend = { code: deck.legend.code };
    }

    newDeck.drawCards = formatCards(deck.drawCards || []);

    return newDeck;
}

function formatCards(cardCounts) {
    return cardCounts.map(function (cardCount) {
        return { count: cardCount.count, card: cardCount.card.custom ? cardCount.card : { code: cardCount.card.code } };
    });
}

module.exports = formatDeckAsShortCards;
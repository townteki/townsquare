'use strict';

var DeckValidator = require('./DeckValidator');
var formatDeckAsFullCards = require('./formatDeckAsFullCards');
var formatDeckAsShortCards = require('./formatDeckAsShortCards');

module.exports = {
    formatDeckAsFullCards: formatDeckAsFullCards,
    formatDeckAsShortCards: formatDeckAsShortCards,
    validateDeck: function validateDeck(deck, options) {
        options = Object.assign({ includeExtendedStatus: true }, options);

        var validator = new DeckValidator(options.packs, options.restrictedLists);
        var result = validator.validateDeck(deck);

        if (!options.includeExtendedStatus) {
            delete result.extendedStatus;
        }

        return result;
    }
};
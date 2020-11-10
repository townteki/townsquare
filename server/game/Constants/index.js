const Tokens = require('./Tokens');

module.exports = {
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    TownSquareUUID: 'townsquare',
    StartingHandSize: 5,
    Tokens
};

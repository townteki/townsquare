const Tokens = require('./Tokens');
const ShootoutStatuses = require('./ShootoutStatuses');

module.exports = {
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    TownSquareUUID: 'townsquare',
    StartingHandSize: 5,
    StartingDiscardNumber: 1,
    DevilJokerCodes: ['10040', '10041'],
    HereticJokerCodes: ['14040', '14041'],
    Tokens,
    ShootoutStatuses,
    BountyType: {
        default: 'default',
        breaking: 'b&e'
    }
};

const ShoppinCardAction = require('./ShoppinCardAction');
const MarshalDuplicateAction = require('./MarshalDuplicateAction');
const SetupCardAction = require('./SetupCardAction');

module.exports = [
    new ShoppinCardAction(),
    new MarshalDuplicateAction(),
    new SetupCardAction()
];

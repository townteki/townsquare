const Effects = require('./effects.js');
const Costs = require('./costs.js');
const AbilityUsage = require('./abilityusage.js');

const AbilityDsl = {
    usage: AbilityUsage,
    effects: Effects,
    costs: Costs
};

module.exports = AbilityDsl;

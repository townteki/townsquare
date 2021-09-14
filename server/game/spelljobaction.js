const JobAction = require('./jobaction.js');
const Spell = require('./spell.js');

/** @typedef {import('./costs')} Costs */
/** @typedef {import('./AbilityTarget').AbilityTargetProperties} AbilityTargetProperties */
/** @typedef {import('./AbilityContext')} AbilityContext */
/** @typedef {import('./jobaction').JobAbilityProperties} JobAbilityProperties */

/** 
 * @typedef {Object} SpellJobActionAbilityProperties 
 * Represents a spell ability provided by card text.
 *
 * Properties:
 * @property {string} title - string that is used within the card menu associated with this
 *                action.
 * @property {string | Array.<string>} playType - string or array of strings representing the type
 *                of action (e.g. `noon`, `shootout`, `shootout:join`, `cheatin resolution`)
 * @property {Function} condition - optional function that should return true when the action is
 *                allowed, false otherwise. It should generally be used to check
 *                if the action can modify game state (step #1 in ability
 *                resolution in the rules).
 * @property {(context: AbilityContext) => boolean} difficulty - number or function representing the difficulty of the spell.
 *                If it is function, it takes context as parameter
 * @property {Costs | Array.<Costs>} cost - object or array of objects representing the cost required to
 *                be paid before the action will activate. See Costs.
 * @property {AbilityTargetProperties} target - object representing card targets for the ability. 
 * @property {JobAbilityProperties} jobProperties - object representing job that will be started if spell is successful. 
 * @property {string} phase - string representing which phases the action may be executed.
 *                Defaults to 'any' which allows the action to be executed in
 *                any phase.
 * @property {string | Array.<string>} location - string indicating the location the card should be in in order
 *                to activate the action. Defaults to 'play area'.
 */
class SpellJobAction extends JobAction {
    constructor(game, card, properties) {
        super(game, card, Object.assign(properties, properties.jobProperties));
        this.spell = new Spell(this, Object.assign(properties, {
            onSuccess: context => super.executeHandler(context)
        }));
    }

    meetsRequirements(context) {
        if(super.meetsRequirements(context)) {
            return this.spell.canBeCasted(context.player);
        }
        return false;
    }

    executeHandler(context) {
        this.spell.executeSpell(context);
    }
}

module.exports = SpellJobAction;

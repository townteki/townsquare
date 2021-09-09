const CardAction = require('./cardaction.js');
const Spell = require('./spell.js');

/** @typedef {import('./costs')} Costs */
/** @typedef {import('./AbilityTarget').AbilityTargetProperties} AbilityTargetProperties */

/** 
 * @typedef {Object} SpellActionAbilityProperties 
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
 * @property {abilityFunc} difficulty - number or function representing the difficulty of the spell.
 *                If it is function, it takes context as parameter
 * @property {Costs | Array.<Costs>} cost - object or array of objects representing the cost required to
 *                be paid before the action will activate. See Costs.
 * @property {AbilityTargetProperties} target - object or array of objects representing the cost required to
 *                be paid before the action will activate. See Costs.* 
 * @property {string} phase - string representing which phases the action may be executed.
 *                Defaults to 'any' which allows the action to be executed in
 *                any phase.
 * @property {string | Array.<string>} location - string indicating the location the card should be in in order
 *                to activate the action. Defaults to 'play area'.
 * @property {number} limit - the max number of uses for the repeatable action.
 * @property {boolean} clickToActivate - boolean that indicates the action should be activated when
 *                   the card is clicked.
 * @property {abilityFunc} onSuccess - function that will be executed if spell succeeds. Takes context
 *                as parameter. 
 * @property {abilityFunc} onFail - function that will be executed if spell fails. Takes context
 *                as parameter.
 */
class SpellAction extends CardAction {
    constructor(game, card, properties) {
        super(game, card, properties);
        this.spell = new Spell(this, properties);
    }

    meetsRequirements(context) {
        if(super.meetsRequirements(context)) {
            return this.spell.canBeCasted(context.player);
        }
        return false;
    }

    executeHandler(context) {
        this.spell.executeSpell(context, () => super.executeHandler(context));
    }
}

module.exports = SpellAction;

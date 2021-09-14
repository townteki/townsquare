const CardReaction = require('./cardreaction.js');
const Spell = require('./spell.js');

/** @typedef {import('./costs')} Costs */
/** @typedef {import('./AbilityTarget').AbilityTargetProperties} AbilityTargetProperties */
/** @typedef {import('./AbilityContext')} AbilityContext */

/** 
 * @typedef {Object} SpellReactionAbilityProperties 
 * Represents a spell React ability provided by card text.
 *
 * Properties:
  * @property {Object} when - object whose keys are event names to listen to for the reaction and
 *           whose values are functions that return a boolean about whether to
 *           trigger the reaction when that event is fired. For example, to
 *           trigger only at the end of the sundown phase, you would do:
 *           when: {
 *               onPhaseEnded: event => event.phase === 'sundown'
 *           }
 *           Multiple events may be specified for cards that have multiple
 *           possible triggers for the same reaction.
 * @property {string} title - function that returns the string to be used as the prompt title. If
 *           none provided, then the title will be "Trigger {card name}?".
 * @property {Costs | Array.<Costs>} cost - object or array of objects representing the cost required to be
 *           paid before the action will activate. See Costs.
 * @property {AbilityTargetProperties} target - object representing card targets for the ability.
 * @property {(context: AbilityContext) => boolean} difficulty - number or function representing the difficulty of the spell.
 *                If it is function, it takes context as parameter 
 * @property {boolean} repeatable - If the react action can be repeated. 
 * @property {boolean} triggerBefore - If the handler of this reaction should be run before the event in `when`
 *           occurs. Should be used mainly if the handler replaces the event handler (actions with instead).
 * @property {Object} choices - object whose keys are text to prompt the player and whose values
 *           are handlers when the player chooses it from the prompt.
 * @property {number} limit - the max number of uses for the repeatable reaction.
 * @property {string | Array.<string>} location - string or array of strings indicating the location the card should
 *            be in in order to activate the reaction. Defaults to 'play area'.
 * @property {function} player - optional function that returns which player to prompt for the
 *            ability. By default, the player that controls the card will be
 *            prompted. Used for reactions that any player can
 *            trigger.
 * @property {boolean} cannotBeCanceled - optional boolean that determines whether an ability can
 *                    be canceled using a cancel reaction.
 * @property {(context: AbilityContext) => boolean} onSuccess - function that will be executed if spell succeeds. Takes context
 *                as parameter. 
 * @property {(context: AbilityContext) => boolean} onFail - function that will be executed if spell fails. Takes context
 *                as parameter.
 */
class SpellReaction extends CardReaction {
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

module.exports = SpellReaction;

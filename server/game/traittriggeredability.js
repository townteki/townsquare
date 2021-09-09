const TriggeredAbility = require('./triggeredability.js');

/**
 * @typedef {Object} TraitAbilityProperties 
 * Represents a forced reaction ability provided by card text.
 *
 * Properties:
 * @property {Object} when - object whose keys are event names to listen to for the reaction and
 *           whose values are functions that return a boolean about whether to
 *           trigger the reaction when that event is fired. For example, to
 *           trigger only at the end of the shootout phase, you would do:
 *           when: {
 *               onPhaseEnded: event => event.phase === 'shootout'
 *           }
 *           Multiple events may be specified for cards that have multiple
 *           possible triggers for the same reaction.
 * @property {boolean} triggerBefore - If the handler of this reaction should be run before the event in `when`
 *           occurs. Should be used mainly if the handler replaces the event handler (actions with instead).
 * @property {boolean} ignoreActionCosts - If the action costs should be ignored.
 * @property {abilityFunc} handler - function that will be executed if the player chooses 'Yes' when
 *           asked to trigger the reaction. If the reaction has more than one
 *           choice, use the choices sub object instead.
 * @property {number} limit   - the max number of uses for the repeatable reaction.
 * @property {string | Array.<string>} location - string or array of string  indicating the location the card should
 *            be in in order to activate the reaction. Defaults to 'play area'.
 */
class TraitTriggeredAbility extends TriggeredAbility {
    meetsRequirements(context) {
        if(!super.meetsRequirements(context)) {
            return false;
        }

        if(this.card.isTraitBlank()) {
            return false;
        }

        return true;
    }

    isTraitAbility() {
        return true;
    }
}

module.exports = TraitTriggeredAbility;

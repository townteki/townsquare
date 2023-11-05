const AbilityUsage = require('./abilityusage.js');
const PromptedTriggeredAbility = require('./promptedtriggeredability.js');

/** @typedef {import('./costs')} Costs */
/** @typedef {import('./AbilityContext')} AbilityContext */

/** 
 * @typedef {Object} ReactionAbilityProperties 
 * Represents a reaction ability provided by card text.
 *
 * Properties:
 * @property {Object} when - object whose keys are event names to listen to for the reaction and
 *           whose values are functions that return a boolean about whether to
 *           trigger the reaction when that event is fired. For example, to
 *           trigger only at the end of the sundown phase, you would do:
 *           when: {
 *               onPhaseEnded: event => event.phase === PhaseNames.Sundown
 *           }
 *           Multiple events may be specified for cards that have multiple
 *           possible triggers for the same reaction.
 * @property {string} title - function that returns the string to be used as the prompt title. If
 *           none provided, then the title will be "Trigger {card name}?".
 * @property {Costs | Array.<Costs>} cost - object or array of objects representing the cost required to be
 *           paid before the action will activate. See Costs.
 * @property {AbilityTargetProperties} target - object representing card targets for the ability.
 * @property {boolean} repeatable - If the react action can be repeated. 
 * @property {boolean} triggerBefore - If the handler of this reaction should be run before the event in `when`
 *           occurs. Should be used mainly if the handler replaces the event handler (actions with instead).
 * @property {(context: AbilityContext) => boolean} handler - function that will be executed if the player chooses 'Yes' when
 *           asked to trigger the reaction. If the reaction has more than one
 *           choice, use the choices sub object instead.
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
 */
class CardReaction extends PromptedTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, 'reaction', properties);
        this.usage = new AbilityUsage(properties);
    }

    executeHandler(context) {
        super.executeHandler(context);
        this.usage.increment();
        if(this.card.hasKeyword('grifter')) {
            this.card.controller.availableGrifterActions -= 1;
        }
    }

    meetsRequirements(context) {
        if(!super.meetsRequirements(context)) {
            return false;
        }
    
        if(this.game.wasHeadlineUsed() && this.card.hasKeyword('headline')) {
            return false;
        }

        if(this.card.hasKeyword('grifter') && this.card.controller.availableGrifterActions === 0) {
            return false;
        }

        if(this.usage.isUsed()) {
            return false;
        }
        
        return true;
    }

    playTypePlayed() {
        return 'react';
    }
}

module.exports = CardReaction;

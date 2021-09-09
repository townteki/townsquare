/** @typedef {import('./AbilityContext')} AbilityContext */
/** @typedef {import('./basecard')} BaseCard */
/** @typedef {import('./abilitydsl')} AbilityDsl */
/** @typedef {import('./gamesteps/shootout')} Shootout */
/**
 * @callback propertyFactory
 * @param {AbilityDsl} ability
 */
/**
 * @callback abilityFunc
 * @param {AbilityContext} context
 */
/**
 * @callback cardContextCondition
 * @param {BaseCard} card
 * @param {AbilityContext} context
 */
/**
 * @callback jobAbilityFunc
 * @param {Shootout} job
 * @param {AbilityContext} context
 */
/** 
 * @typedef {Object} AbilityPropertiesxxx 
 * @property {string} title        - string that is used within the card menu associated with this action.
 * @property {string} condition    - optional function that should return true when the action is
 *                allowed, false otherwise. It should generally be used to check
 *                if the action can modify game state (step #1 in ability
 *                resolution in the rules).
 * @property {string} cost         - object or array of objects representing the cost required to
 *                be paid before the action will activate. See Costs.
 * @property {string} phase        - string representing which phases the action may be executed.
 *                Defaults to 'any' which allows the action to be executed in
 *                any phase.
 * @property {string} location     - string indicating the location the card should be in in order
 *                to activate the action. Defaults to 'play area'.
 * @property {string} limit        - the max number of uses for the repeatable action.
 * @property {string} triggeringPlayer - string indicating player that can execute the action.
 *                Default is 'controller', other possible values are 'owner' or 'any'
 * @property {abilityHandler} handler
*/

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

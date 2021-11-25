/** @typedef {import('../../effect')} Effect */
/** @typedef {import('../../drawcard')} DrawCard */

/* eslint-disable no-unused-vars */
class GunslingerArchetype {
    /**
     * Returns reflex (function) of the Automaton on a specific action.
     *
     * @param {String} type - type of the action we should generate a reflex for.
     * @param {Object} properties - optional properties required to generate a reflex.
     * 
     * @return {Function} function representing a reflex for the specified action.
     */    
    programmedReflex(type, properties) {
        switch(type) {
            case 'callout':
                return () => true;
            default:
                break;
        }
    }

    /**
     * Returns effects ordered by priority for this Archetype.
     *
     * @param {Array.<Effect>} effects - array of effects to be ordered.
     * 
     * @returns {Array.<Effect} effects ordered by priority.
     */     
    effectPriorities(effects) {
    }

    /**
     * Returns target cards ordered by priority for this Archetype.
     *
     * @param {Array.<DrawCard>} cards - array of target cards to be ordered.
     * 
     * @returns {Array.<Effect} target cards ordered by priority.
     */     
    targetPriorities(type, cards) {
        switch(type) {
            case 'discard':
                return () => cards;
            default:
                break;
        }        
    }

    /**
     * Returns function defining the Automaton's action based on a pull.
     *
     * @param {DrawCard} pulledCard - pulled card based on which funciton should be generated.
     * 
     * @return {Function} function representing Automaton action.
     */      
    automatonPulls(pulledCard) {
    }
}

module.exports = GunslingerArchetype;

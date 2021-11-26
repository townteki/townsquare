/** @typedef {import('../../game')} Game */
/** @typedef {import('../../player')} Player */
/** @typedef {import('../../effect')} Effect */
/** @typedef {import('../../drawcard')} DrawCard */

/* eslint-disable no-unused-vars */
class GunslingerArchetype {
    constructor(game, player) {
        /** @type {Game} */
        this.game = game;
        /** @type {Player} */
        this.player = player;
    }

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
            case 'joinPosse':
                return shootout => this.joinPosseReflex(shootout);            
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

    // TODO M2 solo - needs to be ordered based on rules
    joinPosseReflex(shootout) {
        const dudesJoinInfos = this.player.cardsInPlay.filter(card => card.getType() === 'dude' && 
                (card !== shootout.mark || shootout.isJob()) &&
                card !== shootout.leader)
            .map(dude => { 
                return { dude, requirements: dude.requirementsToJoinPosse() };
            })
            .filter(joinInfo => joinInfo.requirements.canJoin);
        return dudesJoinInfos.map(info => info.dude).slice(0, 2);
    }
}

module.exports = GunslingerArchetype;

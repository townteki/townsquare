/** @typedef {import('../../game')} Game */
/** @typedef {import('../../player')} Player */
/** @typedef {import('../../effect')} Effect */
/** @typedef {import('../../drawcard')} DrawCard */

/** 
 * @typedef {Object} ConditionTables 
 * Contains various tables with priority conditions used to sort arrays for Automaton.
 * 
 * Properties:
 * @property {Object} targetPriorities - targetPriorities.
 * @property {(targets: Array.<DrawCard>, cardType: string, controller: string, actionType: string) => 
 *          Array.<DrawCard>} orderByTargetPriorities
*/

/* eslint-disable no-unused-vars */
class BaseArchetype {
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
    programmedReflex(type, properties = {}) {
        switch(type) {
            case 'react':
            case 'jobOppose':
            case 'callout':
                return () => true;
            case 'joinPosse':
                return shootout => this.joinPosseReflex(shootout);
            case 'sendHome':
                if(properties.isFlee) {
                    return () => [];
                }
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
     * @param {String} type
     * @param {Array.<DrawCard>} cards - array of target cards to be ordered.
     * @param {ConditionTables} tables
     * 
     * @returns {Array.<Effect} target cards ordered by priority.
     */     
    targetPriorities(type, cards, tables) {
        const cardTypes = cards.reduce((types, card) => {
            if(!types.includes(card.getType())) {
                types.push(card.getType());
            }
            return types;
        }, []);
        const cardType = cardTypes.length > 1 ? 'any' : cardTypes[0];
        const controller = cards.reduce((result, card) => {
            if(result === 'any') {
                return result;
            }
            if(card.controller === this.player) {
                if(result === 'opponent') {
                    return 'any';
                }
                return 'current';
            }
            if(result === 'current') {
                return 'any';
            }
            return 'opponent';
        }, '');
        switch(type) {
            case 'discard':
            case 'casualties':
                return () => tables.orderByTargetPriorities(cards, cardType, controller, 'leavingPlay');
            default:
                break;
        }        
    }

    automatonPulls() {
    }

    joinPosseReflex() {
    }

    static sortByPriority(array, conditions) {
        const sortFunc = (card1, card2) => {
            return conditions.reduce((value, condition) => {
                if(!value) {
                    return condition(card1, card2);
                }
                return value;
            }, 0);
        };
        return array.sort(sortFunc);
    }

    static highestPriority(array, conditions) {
        if(!array || !array.length) {
            return;
        }
        return BaseArchetype.sortByPriority(array, conditions)[0];
    }

    static getMovesWithoutBoot(dudes, destinations) {
        let moves = [];
        dudes.forEach(dude => {
            destinations.forEach(deed => {
                let reqToMove = dude.requirementsToMove(
                    dude.getGameLocation(), deed.getGameLocation(), { needToBoot: null });
                if(!reqToMove.needToBoot) {
                    moves.push({ dudeToMove: dude, destination: deed });
                }
            });
        });
        return moves;
    }
}

module.exports = BaseArchetype;

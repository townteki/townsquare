/** @typedef {import('../../effect')} Effect */
/** @typedef {import('../../drawcard')} DrawCard */

const Priorities = require('../priorities');
const BaseArchetype = require('./BaseArchetype');

/* eslint-disable no-unused-vars */
class GunfighterArchetype extends BaseArchetype {
    constructor(game, player) {
        super(game, player);
        this.conditionTables = new ConditionTables(this);
    }

    /**
     * Returns effects ordered by priority for this Archetype.
     *
     * @param {Array.<Effect>} effects - array of effects to be ordered.
     * 
     * @returns {Array.<Effect} effects ordered by priority.
     */     
    effectPriorities(effects) {
        return super.effectPriorities(effects);
    }

    /**
     * Returns target cards ordered by priority for this Archetype.
     *
     * @param {Array.<DrawCard>} cards - array of target cards to be ordered.
     * 
     * @returns {Array.<Effect} target cards ordered by priority.
     */     
    targetPriorities(type, cards) {
        return super.targetPriorities(type, cards, this.conditionTables);
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

class ConditionTables {
    constructor(archetype) {
        this.archetype = archetype;

        this.targetPriorities = {
            dude: {
                current: {
                    leavingPlay: [
                        Priorities.lowestInfluence(),
                        Priorities.draw(true),
                        Priorities.lowestCombinedCost()
                    ],
                    receiving: cardToBeReceived => {
                        if(['spell', 'goods'].includes(cardToBeReceived)) {
                            return [
                                (card1, card2) => {
                                    // TODO M2 solo - needs to be completed
                                    return -1;
                                }
                            ];
                        }
                        return [
                            (card1, card2) => {
                                // TODO M2 solo - needs to be completed
                                return -1;
                            }
                        ];
                    }
                },
                opponent: {
        
                },
                any: {
        
                }
            },
            any: {
                
            }
        };
    }

    validateTargetPriorityProperties(cardType, controller, actionType) {
        if(!this.targetPriorities[cardType]) {
            return false;
        }
        if(!this.targetPriorities[cardType][controller]) {
            return false;
        }
        if(!this.targetPriorities[cardType][controller][actionType]) {
            return false;
        }
        return true;
    }

    orderByTargetPriorities(targets, cardType, controller, actionType) {
        if(!this.validateTargetPriorityProperties(cardType, controller, actionType)) {
            return targets;
        }
        const conditions = this.targetPriorities[cardType][controller][actionType];
        return BaseArchetype.sortByPriority(targets, conditions);
    }
}

module.exports = GunfighterArchetype;

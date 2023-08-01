/** @typedef {import('../../game')} Game */
/** @typedef {import('../automaton')} Automaton */
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
        /** @type {Automaton} */
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
            case 'discardFromHand':
                return number => this.player.hand.length ? this.player.hand.slice(0, number) : [];
            case 'upkeepDiscard':
                return cardsWithUpkeep => this.upkeepDiscardCards(cardsWithUpkeep);
            case 'assignCasualties':
                return (casualtyContext, firstCasualty) => this.assignCasualties(casualtyContext, firstCasualty);
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
     * @param {Object} context
     * 
     * @returns {Array.<Effect} target cards ordered by priority.
     */     
    targetPriorities(type, cards, tables, context = {}) {
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
            case 'chooseLeader':
                return () => tables.orderByTargetPriorities(cards, cardType, controller, 'chooseLeader', context);
            case 'joinPosse':
                return () => tables.orderByTargetPriorities(cards, cardType, controller, 'joinPosse');
            case 'chooseMark':
                return () => tables.orderByTargetPriorities(cards, cardType, controller, 'chooseMark');
            default:
                break;
        }        
    }

    automatonPulls() {
    }

    joinPosseReflex() {
    }

    upkeepDiscardCards() {
    }

    assignCasualties() {
    }

    getCalleeCondition() {
        return card => card.getType() === 'dude' &&
            card.controller !== this.player &&
            (!this.game.isHome(card.gamelocation, card.controller) || card.canBeCalledOutAtHome()) &&
            card.canBeCalledOut({ game: this.game, player: this.player });
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

    static hasEnabledAbilityOfType(player, dude, abilityType, checkActionContext = true) {
        const hasAbility = (card, player) => {
            card.abilities.actions.some(action => {
                if(!action.playType.includes(abilityType)) {
                    return false;
                }
                if(action.ifCondition && !action.ifCondition({ game: card.game, player: player })) {
                    return false;
                }
                if(checkActionContext && (!action.actionContext || action.actionContext.card !== dude)) {
                    return false;
                }
                return card.hasEnabledCardAbility(player, {}, action);
            });
        };
        return hasAbility(dude, player) || dude.attachments.some(att => hasAbility(att, player));
    }

    static getJoinRequirements(cards) {
        return cards.filter(card => card.getType() === 'dude')
            .reduce((reqs, dude) => { 
                reqs[dude.uuid] = Object.assign({ dude }, dude.requirementsToJoinPosse());
                return reqs;
            }, {});
    }

    static handleCasualty(type, casualty, resolutions, casualtyContext) {
        let maxCoveredNum = casualty.coversCasualties('any');
        let coveredNum = casualty.coversCasualties(type);
        if(!coveredNum) {
            return resolutions;
        }
        if((casualtyContext.maxPossibleCasualties - (maxCoveredNum - coveredNum)) < casualtyContext.currentCasualtiesNum) {
            return resolutions;
        }
        if(casualtyContext.currentCasualtiesNum - coveredNum >= 0) {
            casualtyContext.currentCasualtiesNum -= coveredNum;
            casualtyContext.availableVictims = casualtyContext.availableVictims.filter(victim => victim !== casualty);
            resolutions.push({
                card: casualty,
                type: type,
                covered: coveredNum
            });
        }
        return resolutions;   
    }
}

module.exports = BaseArchetype;

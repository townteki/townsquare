/** @typedef {import('../../effect')} Effect */
/** @typedef {import('../../drawcard')} DrawCard */

const PhaseNames = require('../../Constants/PhaseNames');
const GameActions = require('../../GameActions');
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
    automatonPulls(pulledCard, playWindow) {
        this.player.moveCard(pulledCard, 'hand');
        if(pulledCard.getType() !== 'joker') {
            this.performPullSteps(pulledCard.suit, playWindow.name);
        } else {
            this.performPullSteps('Hearts', playWindow.name);
            this.performPullSteps('Spades', playWindow.name);
            this.performPullSteps('Diams', playWindow.name);
            this.performPullSteps('Clubs', playWindow.name);
            this.game.queueSimpleStep(() => this.player.moveCard(pulledCard, 'dead pile'));
        }
    }

    performPullSteps(suit, playWindowName) {
        let cardUsed = false;
        if(playWindowName === PhaseNames.HighNoon) {
            this.game.queueSimpleStep(() => this.automatonMove(suit));
        }
        this.game.queueSimpleStep(() => {
            cardUsed = this.automatonPlayCard(suit);
        });
        this.game.queueSimpleStep(() => {
            if(!cardUsed) {
                cardUsed = this.automatonUseAbility(suit);
            }
        });
        this.game.queueSimpleStep(() => {
            if(!cardUsed) {
                this.player.modifyGhostRock(1);
                this.game.addMessage('{0} gets 1 GR as Recompense', this.player);
            }
            const cardsToDiscard = this.player.getCardsToDiscardDownToHandSize();
            if(cardsToDiscard.length) {
                this.player.discardCards(cardsToDiscard, false, () => {
                    this.game.addMessage('{0} discards {1} to meet hand size limit', this.player, cardsToDiscard);
                });
            }
        }); 
    }

    automatonMove(suit) {
        const unbootedDudes = this.player.cardsInPlay.filter(card => 
            card.getType() === 'dude' && !card.booted);
        let moveInfo = this.moveBasedOnSuit(suit, unbootedDudes);
        // TODO M2 solo - for now do not do move if clubs because it was done in `moveBasedOnSuit` function
        if(suit !== 'Clubs') {
            if(!moveInfo && suit !== 'Spades') {
                moveInfo = this.moveBasedOnSuit('Spades', unbootedDudes);
            }
            if(moveInfo) {
                this.game.resolveGameAction(GameActions.moveDude({
                    card: moveInfo.dudeToMove,
                    targetUuid: moveInfo.destination.uuid,
                    options: { isCardEffect: false }
                }), { game: this.game, player: this.player });
            } else {
                this.game.addMessage('{0} is not moving any Dude', this.player);
            }
        }
    }

    moveBasedOnSuit(suit, unbootedDudes = []) {
        const isAtOppDeed = dude => {
            const dudeLocation = dude.locationCard;
            return dudeLocation &&
                dudeLocation.getType() === 'deed' &&
                dudeLocation.owner !== dude.controller;
        };
        let dudeToMove;
        let destination;
        // TODO M2 solo - remove this once joker is implemented
        if(!suit || !unbootedDudes.length) {
            return;
        }
        // ***
        switch(suit) {
            case 'Hearts': {
                let possibleDudes = unbootedDudes.filter(dude => !dude.isAtHome() && !isAtOppDeed(dude));
                let possibleDeeds = this.game.findCardsInPlay(card => 
                    card.getType() === 'deed' && card.owner !== this.player);
                if(possibleDudes.length && possibleDeeds.length) {
                    dudeToMove = BaseArchetype.highestPriority(possibleDudes, [
                        Priorities.hasInfluence(true),
                        Priorities.stud(),
                        Priorities.highestBullets()
                    ]);
                    destination = BaseArchetype.highestPriority(possibleDeeds, [
                        Priorities.highestControl(),
                        Priorities.highestProduction()
                    ]);
                }
            } break;
            case 'Spades': {
                let possibleDudes = unbootedDudes.filter(dude => !isAtOppDeed(dude));
                if(possibleDudes.length) {
                    dudeToMove = BaseArchetype.highestPriority(possibleDudes, [
                        Priorities.isAtHome(),
                        Priorities.isInOpponentHome(),
                        Priorities.stud(),
                        Priorities.hasInfluence(),
                        Priorities.highestBullets()
                    ]);
                    destination = this.game.townsquare;
                }
            } break;
            case 'Diams': {
                let orderedDudes = BaseArchetype.sortByPriority(unbootedDudes, [
                    Priorities.isSkilled(),
                    Priorities.highestInfluence(),
                    Priorities.stud(),
                    Priorities.highestBullets()
                ]);
                const unbootedAtTS = this.game.getDudesAtLocation(this.game.townsquare.uuid, dude => !dude.booted);
                orderedDudes = orderedDudes.find(dude => {
                    if(unbootedAtTS.length === 1 && unbootedAtTS.includes(dude)) {
                        return false;
                    }
                    const dudeLocation = dude.getGameLocation();
                    if(!dudeLocation) {
                        return false;
                    }
                    if(dudeLocation.card.control && dudeLocation.card.controller === this.player) {
                        dudeLocation.removeDude(dude);
                        let newController = dudeLocation.determineController();
                        dudeLocation.addDude(dude);
                        if(newController !== this.player) {
                            return false;
                        }
                    }
                    return true;
                });
                if(orderedDudes.length) {
                    let possibleDeeds = this.game.findCardsInPlay(card => 
                        card.getType() === 'deed' && card.owner === this.player);
                    // TODO M2 solo - this should be ordered based on priority where the second is: 
                    //                Deeds with an ability affecting dudes at that deed (needs to be implemented)
                    let orderedDestinations = BaseArchetype.sortByPriority(possibleDeeds, [
                        Priorities.notControlledBy(this.player)
                    ]);
                    let movesInfo = BaseArchetype.getMovesWithoutBoot(orderedDudes, orderedDestinations);
                    if(movesInfo.length) {
                        dudeToMove = movesInfo[0].dudeToMove;
                        destination = movesInfo[0].destination;
                    }
                }
            } break;
            case 'Clubs': {
                // TODO M2 solo - for now, let player select who is calling who
                //                later, when targeting priorities will be implemented, do it automatically
                this.game.promptForSelect(this.player, {
                    activePromptTitle: 'Select a caller',
                    cardCondition: card => unbootedDudes.includes(card),
                    onSelect: (player, caller) => {
                        this.game.promptForSelect(player, {
                            activePromptTitle: 'Select a callee',
                            cardCondition: card => card.controller !== this.player &&
                                card.gamelocation === caller.gamelocation,
                            cardType: 'dude',
                            onSelect: (player, callee) => {
                                this.game.resolveGameAction(GameActions.callOut({ caller, callee, isCardEffect: false }),
                                    { cage: this.game, player: this.player });
                                return true;
                            }
                        });
                        return true;
                    },
                    onCancel: () => {
                        let orderedCallers = BaseArchetype.sortByPriority(unbootedDudes, [
                            Priorities.stud(),
                            Priorities.highestBullets()
                        ]);
                        let possibleCallees = this.player.getOpponent().cardsInPlay.filter(card => card.getType() === 'dude' &&
                            (!this.game.isHome(card.gamelocation, card.controller) || card.canBeCalledOutAtHome()) &&
                            card.canBeCalledOut({ game: this.game, player: this.player }));
                        let orderedCallees = BaseArchetype.sortByPriority(possibleCallees, [
                            Priorities.highestControl(),
                            Priorities.highestInfluence(),
                            Priorities.mostAttachments(),
                            Priorities.highestCost()
                        ]);
                        dudeToMove = orderedCallers.find(caller => {
                            let viaTS = false;
                            let foundCallee = orderedCallees.find(callee => {
                                let reqForMove = caller.requirementsToMove(caller.getGameLocation(), callee.getGameLocation(), { isCardEffect: false });
                                if(!reqForMove.needToBoot) {
                                    return true;
                                }
                                let reqForMoveToTS = caller.requirementsToMove(caller.getGameLocation(), this.game.townsquare, { isCardEffect: false });
                                if(!reqForMoveToTS.needToBoot) {
                                    viaTS = true;
                                    return true;
                                }
                                return false;
                            });
                            if(viaTS) {
                                destination = this.game.townsquare;
                                return true;
                            } else if(foundCallee) {
                                destination = foundCallee.getGameLocation();
                                return true;
                            }
                            return false;
                        });
                        // TODO M2 solo - for now do the clubs move here, until the prompt is replaced with automatic function
                        if(!dudeToMove) {
                            let moveInfo = this.moveBasedOnSuit('Spades', unbootedDudes);
                            if(moveInfo) {
                                dudeToMove = moveInfo.dudeToMove;
                                destination = moveInfo.destination;
                            }
                        }
                        if(dudeToMove) {
                            this.game.resolveGameAction(GameActions.moveDude({
                                card: dudeToMove,
                                targetUuid: destination.uuid,
                                options: { isCardEffect: false }
                            }), { game: this.game, player: this.player });
                        }
                        // ************
                        return true;
                    }
                });
            } break;
            default:
                break;
        }
        return dudeToMove ? { dudeToMove, destination } : null;
    }

    automatonPlayCard(suit) {
        let possibleCards = this.player.hand.filter(card => card.suit === suit);
        if(!possibleCards.length) {
            return false;
        }
        let playActions = [];
        if(suit !== 'Clubs') {
            possibleCards.forEach(card => {
                if(this.game.currentPhase === PhaseNames.HighNoon && this.player.playablePlayActions(card, 'shoppin').length) {
                    playActions.push({
                        card,
                        playFunction: () => this.player.playCard(card, 'shoppin', { doNotMarkActionAsTaken: true })
                    });
                } else if(card.abilities.playActions.length > 0) {
                    if(card.abilities.playActions.some(playAction => 
                        playAction.meetsRequirements(playAction.createContext(this.player)))) {
                        playActions.push({
                            card,
                            playFunction: () => this.player.playCard(card, 'play', { doNotMarkActionAsTaken: true })
                        });
                    }
                }
            });
        } else {
            playActions = possibleCards.filter(card => card.hasEnabledCardAbility(this.player))
                .map(card => {
                    return {
                        card,
                        playFunction: () => card.useAbility(this.player, { doNotMarkActionAsTaken: true })
                    };
                });
        }
        if(!playActions.length) {
            return false;
        }
        if(playActions.length > 1) {
            if(suit !== 'Clubs') {
                let minCount = 999;
                playActions = playActions.reduce((result, playAction) => {
                    let count = this.player.cardsInPlay.filter(card => 
                        card.value === playAction.card.value && card.suit === playAction.card.suit).length;
                    if(count < minCount) {
                        minCount = count;
                        return [playAction];
                    }
                    if(count === minCount) {
                        result.push(playAction);
                    }
                    return result;
                }, []);
            }
        }
        playActions[0].playFunction();
        return true;
    }

    automatonUseAbility(suit) {
        const processList = [
            { suit: 'Clubs' },
            { suit: 'Diams' },
            { suit: 'Spades' },
            { suit: 'Hearts' },
            { type: 'outfit' },
            { type: 'legend' }
        ];
        let startIndex = processList.findIndex(e => e.suit === suit);
        let index = startIndex + 1;
        let possibleCards = [];
        while(index !== startIndex) {
            let currentElement = processList[index];
            possibleCards = this.player.cardsInPlay.filter(card => 
                (card.suit === currentElement.suit || card.getType() === currentElement.type) &&
                card.hasEnabledCardAbility(this.player));
            if(currentElement.suit === 'Clubs') {
                possibleCards = possibleCards.concat(this.player.hand.filter(card => 
                    card.suit === 'Clubs' && card.hasEnabledCardAbility(this.player)));
            }
            if(possibleCards.length) {
                break;
            }
            index = index === (processList.length - 1) ? 0 : index + 1;
        }
        // TODO M2 solo - select manually until Effect properties are implemented
        if(possibleCards.length) {
            this.game.promptForSelect(this.player, {
                activePromptTitle: 'Select a card to use',
                cardCondition: card => possibleCards.includes(card),
                onSelect: (player, card) => {
                    card.useAbility(player, { doNotMarkActionAsTaken: true });
                    return true;
                },
                onCancel: () => {
                    this.player.modifyGhostRock(1);
                    this.game.addMessage('{0} gets 1 GR as Recompense', this.player);
                }
            });
        }
        return !!possibleCards.length;
    }

    // TODO M2 solo - needs to be ordered based on rules
    joinPosseReflex(shootout) {
        const jobMark = shootout.isJob() && shootout.mark.getType() === 'dude' ? [shootout.mark] : [];
        const dudesJoinInfos = this.player.cardsInPlay.filter(card => card.getType() === 'dude' && 
                card !== shootout.mark && card !== shootout.leader)
            .map(dude => { 
                return { dude, requirements: dude.requirementsToJoinPosse() };
            })
            .filter(joinInfo => joinInfo.requirements.canJoin);
        return jobMark.concat(dudesJoinInfos.map(info => info.dude).slice(0, 2));
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

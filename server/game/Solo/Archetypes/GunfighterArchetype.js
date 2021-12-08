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
        let cardUsed = false;
        if(playWindow.name === PhaseNames.HighNoon) {
            this.game.queueSimpleStep(() => this.automatonMove(pulledCard));
        }
        this.game.queueSimpleStep(() => {
            cardUsed = this.automatonPlayCard(pulledCard);
        });
        this.game.queueSimpleStep(() => {
            if(!cardUsed) {
                cardUsed = this.automatonUseAbility(pulledCard);
            }
        });
        this.game.queueSimpleStep(() => {
            if(!cardUsed) {
                this.player.modifyGhostRock(1);
                this.game.addMessage('{0} gets 1 GR as Recompense', this.player);
            }
        });
    }

    automatonMove(pulledCard) {
        const unbootedDudes = this.player.cardsInPlay.filter(card => 
            card.getType() === 'dude' && !card.booted);
        let moveInfo = this.moveBasedOnSuit(pulledCard.suit, unbootedDudes);
        // TODO M2 solo - for now do not do move if clubs because it was done in `moveBasedOnSuit` function
        if(pulledCard.suit !== 'clubs') {
            if(!moveInfo && pulledCard.suit !== 'Spades') {
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
                                let reqForMoveFromTS = caller.requirementsToMove(this.game.townsquare, callee.getGameLocation(), { isCardEffect: false });
                                if(!reqForMoveFromTS.needToBoot) {
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

    automatonPlayCard(pulledCard) {
        return false;
    }

    automatonUseAbility(pulledCard) {
        return false;
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

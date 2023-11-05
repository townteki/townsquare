/** @typedef {import('../../effect')} Effect */
/** @typedef {import('../../drawcard')} DrawCard */

const PhaseNames = require('../../Constants/PhaseNames');
const PlayingTypes = require('../../Constants/PlayingTypes');
const GameActions = require('../../GameActions');
const { Priorities, booleanCondition } = require('../priorities');
const BaseArchetype = require('./BaseArchetype');

/* eslint-disable no-unused-vars */
class GunfighterArchetype extends BaseArchetype {
    constructor(game, player) {
        super(game, player);
        this.conditionTables = new ConditionTables(this);
        this.shootoutStarted = false;
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
        const eventHandler = () => this.shootoutStarted = true;
        if(playWindow.name === PhaseNames.HighNoon) {
            this.game.once('onShootoutPhaseStarted', eventHandler);
        }
        if(pulledCard.getType() !== 'joker') {
            this.performPullSteps(pulledCard.suit, playWindow.name);
        } else {
            this.performPullSteps('Hearts', playWindow.name);
            this.performPullSteps('Spades', playWindow.name);
            this.performPullSteps('Diams', playWindow.name);
            this.performPullSteps('Clubs', playWindow.name);
            this.game.queueSimpleStep(() => this.player.moveCard(pulledCard, 'dead pile'));
        }
        if(playWindow.name === PhaseNames.HighNoon) {
            this.game.queueSimpleStep(() => {
                this.game.removeListener('onShootoutPhaseStarted', eventHandler);
                this.shootoutStarted = false;
                return true;
            });
        }
    }

    performPullSteps(suit, playWindowName) {
        let cancelled = false;
        let cardUsed = false;
        if(playWindowName === PhaseNames.HighNoon) {
            this.game.queueSimpleStep(() => this.automatonMove(suit));
        }
        this.game.queueSimpleStep(() => {
            cancelled = this.shootoutStarted && playWindowName === PhaseNames.HighNoon;
            if(!cancelled) {
                cardUsed = this.automatonPlayCard(suit);
            }
        });
        this.game.queueSimpleStep(() => {
            if(!cardUsed && !cancelled) {
                cardUsed = this.automatonUseAbility(suit);
            }
        });
        this.game.queueSimpleStep(() => {
            if(!cardUsed && !cancelled) {
                this.player.modifyGhostRock(1);
                this.game.addMessage('{0} gets 1 GR as Recompense', this.player);
            }
            const cardsToDiscard = this.player.getCardsToDiscardDownToHandSize();
            if(cardsToDiscard.length) {
                this.player.discardCards(cardsToDiscard, () => {
                    this.game.addMessage('{0} discards {1} to meet hand size limit', this.player, cardsToDiscard);
                });
            }
        }); 
    }

    automatonMove(suit) {
        const unbootedDudes = this.player.cardsInPlay.filter(card => 
            card.getType() === 'dude' && !card.booted);
        let moveInfo = this.moveBasedOnSuit(suit, unbootedDudes);
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

    moveBasedOnSuit(suit, unbootedDudes = []) {
        const isAtOppDeed = dude => {
            const dudeLocation = dude.locationCard;
            return dudeLocation &&
                dudeLocation.getType() === 'deed' &&
                dudeLocation.owner !== dude.controller;
        };
        let dudeToMove;
        let destination;
        if(!unbootedDudes.length) {
            return;
        }
        switch(suit) {
            case 'Hearts': {
                let possibleDudes = unbootedDudes.filter(dude => !dude.isAtHome() && !isAtOppDeed(dude));
                let possibleDeeds = this.game.findCardsInPlay(card => 
                    card.getType() === 'deed' && card.owner !== this.player);
                if(possibleDudes.length && possibleDeeds.length) {
                    let orderedDudes = BaseArchetype.sortByPriority(possibleDudes, [
                        Priorities.hasInfluence(true),
                        Priorities.stud(),
                        Priorities.highestBullets()
                    ]);
                    destination = BaseArchetype.highestPriority(possibleDeeds, [
                        Priorities.highestControl(),
                        Priorities.highestProduction()
                    ]);
                    if(!this.player.isInCheck()) {
                        dudeToMove = orderedDudes.find(dude => !this.player.isInCheckAfterMove(dude, destination.uuid));
                    } else {
                        dudeToMove = orderedDudes[0];
                    }
                }
            } break;
            case 'Spades': {
                let possibleDudes = unbootedDudes.filter(dude => !isAtOppDeed(dude));
                if(possibleDudes.length) {
                    let orderedDudes = BaseArchetype.sortByPriority(possibleDudes, [
                        Priorities.isAtHome(),
                        Priorities.isInOpponentHome(),
                        Priorities.stud(),
                        Priorities.hasInfluence(),
                        Priorities.highestBullets()
                    ]);
                    destination = this.game.townsquare;
                    if(!this.player.isInCheck()) {
                        dudeToMove = orderedDudes.find(dude => !this.player.isInCheckAfterMove(dude, destination.uuid));
                    } else {
                        dudeToMove = orderedDudes[0];
                    }
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
                orderedDudes = orderedDudes.filter(dude => {
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
                    let possibleMoves = BaseArchetype.getMovesWithoutBoot(orderedDudes, orderedDestinations);
                    if(possibleMoves.length) {
                        let moveInfo = [0];
                        if(!this.player.isInCheck()) {
                            moveInfo = possibleMoves.find(move => !this.player.isInCheckAfterMove(move.dudeToMove, move.destination.uuid));
                        }
                        if(moveInfo) {
                            dudeToMove = moveInfo.dudeToMove;
                            destination = moveInfo.destination;
                        }
                    }
                }
            } break;
            case 'Clubs': {
                let calloutParticipants = this.player.chooseCalloutParticipants(() => true, this.getCalleeCondition());
                if(calloutParticipants.leader) {
                    this.game.resolveGameAction(GameActions.callOut({ 
                        caller: calloutParticipants.leader, 
                        callee: calloutParticipants.mark, 
                        isCardEffect: false 
                    }), { game: this.game, player: this.player });
                } else {
                    let orderedCallers = BaseArchetype.sortByPriority(unbootedDudes, [
                        Priorities.stud(),
                        Priorities.highestBullets()
                    ]);
                    let possibleCallees = this.player.getOpponent().cardsInPlay.filter(this.getCalleeCondition());
                    let orderedCallees = BaseArchetype.sortByPriority(possibleCallees, [
                        Priorities.highestControl(),
                        Priorities.highestInfluence(),
                        Priorities.mostAttachments(),
                        Priorities.highestCost()
                    ]);
                    dudeToMove = orderedCallers.find(caller => {
                        let foundCallee = orderedCallees.find(callee => {
                            let reqForMove = caller.requirementsToMove(caller.getGameLocation(), callee.getGameLocation(), { isCardEffect: false });
                            return !reqForMove.needToBoot;
                        });
                        if(foundCallee) {
                            destination = foundCallee.getGameLocation();
                            return !this.player.isInCheck() || !this.player.isInCheckAfterMove(caller, destination.uuid);
                        }
                        return false;
                    });
                }
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
                if(this.game.currentPhase === PhaseNames.HighNoon && this.player.playablePlayActions(card, PlayingTypes.Shoppin).length) {
                    playActions.push({
                        card,
                        playFunction: () => this.player.playCard(card, PlayingTypes.Shoppin, { doNotMarkActionAsTaken: true })
                    });
                } else if(card.abilities.playActions.length > 0) {
                    if(card.abilities.playActions.some(playAction => 
                        playAction.meetsRequirements(playAction.createContext(this.player)))) {
                        playActions.push({
                            card,
                            playFunction: () => this.player.playCard(card, PlayingTypes.Play, { doNotMarkActionAsTaken: true })
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

    joinPosseReflex(shootout) {
        const jobMark = shootout.isJob() && shootout.mark && shootout.mark.getType() === 'dude' ? [shootout.mark] : [];
        const possibleDudes = this.player.cardsInPlay.filter(card => card.getType() === 'dude' && 
                card !== shootout.mark && card !== shootout.leader);

        return jobMark.concat((this.player.orderByTargetPriority(possibleDudes, 'joinPosse')).slice(0, 2));
    }

    upkeepDiscardCards(cardsWithUpkeep) {
        const orderedCards = BaseArchetype.sortByPriority(cardsWithUpkeep, [Priorities.highestCombinedCost()]);
        let currentGR = this.player.ghostrock;
        let cardsToDiscard = [];
        orderedCards.forEach(card => {
            if(currentGR >= card.upkeep) {
                currentGR -= card.upkeep;
            } else {
                cardsToDiscard.push(card);
            }
        });
        return cardsToDiscard;
    }

    assignCasualties(casualtyContext, firstCasualty) {
        let resolutions = [];
        // 1. check if there are any cards that has to be selected as first casualty
        if(casualtyContext.availableVictims.includes(firstCasualty)) {
            const numOfResolutions = resolutions.length;
            resolutions = BaseArchetype.handleCasualty('sendHome', firstCasualty, resolutions, casualtyContext);
            if(resolutions.length === numOfResolutions) {
                resolutions = BaseArchetype.handleCasualty('discard', firstCasualty, resolutions, casualtyContext);
                if(resolutions.length === numOfResolutions) {
                    resolutions = BaseArchetype.handleCasualty('ace', firstCasualty, resolutions, casualtyContext);
                }
            }
        }
        // if casualties are zero by resolving the first casualty, we are done
        if(casualtyContext.currentCasualtiesNum === 0) {
            return resolutions;
        }

        [...casualtyContext.availableVictims].forEach(victim => {
            if(victim.hasKeyword('harrowed') && casualtyContext.currentCasualtiesNum > 0) {
                resolutions = BaseArchetype.handleCasualty('sendHome', victim, resolutions, casualtyContext);
            }
        });
        if(casualtyContext.currentCasualtiesNum === 0) {
            return resolutions;
        }

        // 2. check if there are any sidekick cards that can be selected as casualty
        [...casualtyContext.availableVictims].forEach(victim => {
            if(victim.hasKeyword('sidekick') && casualtyContext.currentCasualtiesNum > 0) {
                resolutions = BaseArchetype.handleCasualty('discard', victim, resolutions, casualtyContext);
            }
        });
        // if casualties are zero by resolving the sidekick, we are done
        if(casualtyContext.currentCasualtiesNum === 0) {
            return resolutions;
        }

        [...casualtyContext.availableVictims].forEach(victim => {
            if(victim.hasKeyword('token') && casualtyContext.currentCasualtiesNum > 0) {
                const numOfResolutions = resolutions.length;
                resolutions = BaseArchetype.handleCasualty('ace', victim, resolutions, casualtyContext);
                if(resolutions.length === numOfResolutions) {
                    resolutions = BaseArchetype.handleCasualty('discard', victim, resolutions, casualtyContext);
                    if(resolutions.length === numOfResolutions) {
                        resolutions = BaseArchetype.handleCasualty('sendHome', victim, resolutions, casualtyContext);
                    }
                }
            }
        });
        // 3. check other cards that can be selected as casualties to resolve rest
        let restOfVictims = this.player.orderByTargetPriority(casualtyContext.availableVictims, 'casualties');
        return resolutions.concat(restOfVictims.reduce((result, victim) => {
            if(casualtyContext.currentCasualtiesNum === 0) {
                return result;
            }
            let casualtyInfos = [{
                card: victim,
                type: 'ace',
                covered: victim.coversCasualties('ace')
            }];
            casualtyInfos.push({
                card: victim,
                type: 'discard',
                covered: victim.coversCasualties('discard')
            });
            casualtyInfos.push({
                card: victim,
                type: 'sendHome',
                covered: victim.coversCasualties('sendHome')
            });
            casualtyInfos = casualtyInfos.filter(info => info.covered > 0).sort((info1, info2) => {
                let remain1 = casualtyContext.currentCasualtiesNum - info1.covered;
                let remain2 = casualtyContext.currentCasualtiesNum - info2.covered;
                if(remain1 === remain2) {
                    if(info1.type === 'sendHome') {
                        return -1;
                    }
                    if(info2.type === 'sendHome') {
                        return 1;
                    }
                    if(info1.type === 'discard') {
                        return -1;
                    }
                    if(info2.type === 'discard') {
                        return 1;
                    }
                }
                if(remain1 < 0 && remain2 === 0) {
                    return 1;
                }
                if(remain2 < 0 && remain1 === 0) {
                    return -1;
                }
                return Math.abs(remain1) - Math.abs(remain2);
            });
            result.push(casualtyInfos[0]);
            casualtyContext.currentCasualtiesNum -= casualtyInfos[0].covered;
            return result;
        }, []));
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
                    leaderOrJoin: dudeInfos => {
                        return [
                            (dude1, dude2) => booleanCondition(!dudeInfos[dude1.uuid].hasJoinAbility, 
                                !dudeInfos[dude2.uuid].hasJoinAbility),
                            (dude1, dude2) => booleanCondition(!dudeInfos[dude1.uuid].needToBoot, 
                                !dudeInfos[dude2.uuid].needToBoot),
                            Priorities.stud(),
                            Priorities.highestBullets(),
                            (dude1, dude2) => booleanCondition(dudeInfos[dude1.uuid].hasShootoutResAbility, 
                                dudeInfos[dude2.uuid].hasShootoutResAbility),
                            Priorities.lowestInfluence()
                        ];
                    },
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
                    mark: [
                        Priorities.highestControl(),
                        Priorities.highestInfluence(),
                        Priorities.mostAttachments(),
                        Priorities.highestCost()
                    ]
                },
                any: {
        
                }
            },
            any: {
                
            }
        };
    }

    getTargetPriorityConditions(cardType, controller, actionType, ...args) {
        if(!this.targetPriorities[cardType]) {
            return;
        }
        if(!this.targetPriorities[cardType][controller]) {
            return;
        }
        if(!this.targetPriorities[cardType][controller][actionType]) {
            return;
        }
        const conditions = this.targetPriorities[cardType][controller][actionType];
        return typeof(conditions) === 'function' ? conditions(...args) : conditions;
    }

    orderByTargetPriorities(targets, cardType, controller, actionType, context = {}) {
        let conditions;
        switch(actionType) {
            case 'chooseLeader':
            case 'joinPosse': {
                const game = this.archetype.game;
                const joinReqs = BaseArchetype.getJoinRequirements(targets);
                let clonedGame;
                if(game.shootout) {
                    clonedGame = game.simulateShootout('shootout plays', game.shootout.gamelocation);
                } else if(context.mark) {
                    clonedGame = game.simulateShootout('shootout plays', context.mark);
                }
                const dudesThatCannotJoin = [];
                for(let dudeUuid in joinReqs) {
                    let dudeJoinInfo = joinReqs[dudeUuid];
                    if(!dudeJoinInfo.canJoin) {
                        dudesThatCannotJoin.push(dudeUuid);
                        continue;
                    }
                    dudeJoinInfo.hasShootoutResAbility = dudeJoinInfo.dude.hasAbilityForType('shootout') || 
                        dudeJoinInfo.dude.hasAbilityForType('resolution');
                    if(clonedGame) {
                        const clonedDude = clonedGame.findCardInPlayByUuid(dudeUuid);
                        dudeJoinInfo.hasJoinAbility = BaseArchetype.hasEnabledAbilityOfType(this.player, clonedDude, 'shootout:join');
                    }
                }
                dudesThatCannotJoin.forEach(dudeUuid => {
                    targets = targets.filter(target => target.uuid !== dudeUuid);
                    delete joinReqs[dudeUuid];
                });

                conditions = this.getTargetPriorityConditions(cardType, controller, 'leaderOrJoin', joinReqs);
                break;
            }
            default:
                conditions = this.getTargetPriorityConditions(cardType, controller, actionType);
                break;
        }
        if(!conditions) {
            return targets;
        }
        return BaseArchetype.sortByPriority(targets, conditions);
    }
}

module.exports = GunfighterArchetype;

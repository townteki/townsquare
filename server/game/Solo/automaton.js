
const uuid = require('uuid');

const Player = require('../player.js');
const GunfighterArchetype = require('./Archetypes/GunfighterArchetype.js');
const HandResult = require('../handresult.js');
const { Priorities } = require('./priorities.js');
const BaseArchetype = require('./Archetypes/BaseArchetype.js');

class Automaton extends Player {
    constructor(game, user) {
        super(uuid.v1(), user, false, game);
        this.decisionEngine = new GunfighterArchetype(game, this);
    }

    isAutomaton() {
        return true;
    }

    prepareDecks() {
        super.prepareDecks();
        this.standaloneDeckId = this.deck.standaloneDeckId;
    }

    discardFromHand(number = 1, callback = () => true, options = {}, context) {
        let updatedOptions = Object.assign({ discardExactly: false }, options);
        const cardsToDiscard = this.getCardsToDiscard(number, updatedOptions);
        if(updatedOptions.discardExactly && cardsToDiscard.length !== number) {
            return;
        }
        this.discardCards(cardsToDiscard, discarded => {
            callback(discarded);
        }, updatedOptions, context);
    }

    selectScientistToInvent(gadget, successHandler, scientistCondition) {
        // TODO M2 solo - update this once there will be Automaton rules for this
        super.selectScientistToInvent(gadget, successHandler, scientistCondition);
    }

    finalizeDrawHand(handResult) {
        if(this.drawHand.length > 5) {
            const cardsToDiscard = this.drawHand.filter(drawCard => 
                !handResult.getHandRank().cards.map(card => card.uuid).includes(drawCard.uuid));
            this.discardCards(cardsToDiscard, () =>
                this.game.addMessage('{0} discards {1} to make its draw hand', this, cardsToDiscard));
        }
    }

    makeDrawHand(studBonus, drawBonus) {
        this.drawCardsToDrawHand(studBonus).thenExecute(event => {
            const studCards = event.cards;
            if(drawBonus) {
                let event = this.drawCardsToDrawHand(drawBonus);
                if(!event.isNull()) {
                    event.thenExecute(event => {
                        const drawCards = event.cards;
                        this.game.addAlert('warn', '{0} draws additional cards to draw hand: {1}', this, drawCards);
                        let bestHandResult = drawCards.reduce((bestHandResult, drawCard) => {
                            const handResult = new HandResult(studCards.concat([drawCard]), false, true);
                            if(!bestHandResult || bestHandResult.getHandRank().rank < handResult.getHandRank().rank) {
                                return handResult;
                            }
                            if(bestHandResult.getHandRank().rank === handResult.getHandRank().rank) {
                                if(bestHandResult.getHandRank().cheatin && !handResult.getHandRank().cheatin) {
                                    return handResult;
                                }
                                if(bestHandResult.getHandRank().jokersUsed && !handResult.getHandRank().jokersUsed) {
                                    return handResult;
                                }
                            }
                            return bestHandResult;
                        }, null);
                        this.finalizeDrawHand(bestHandResult);
                    });
                } else {
                    this.finalizeDrawHand(new HandResult(studCards, false, true));
                }
            } else {
                this.finalizeDrawHand(new HandResult(studCards, false, true));
            }
        });
    }

    makeAutomatonPull(playWindow) {
        if(this.drawDeck.length === 0) {
            this.shuffleDiscardToDrawDeck();
        }
        const pulledCard = this.drawDeck[0];
        if(pulledCard.getType() === 'joker') {
            this.game.addAlert('info', '{0} makes an Automaton pull: {1}', this, pulledCard);
        } else {
            this.game.addAlert('info', '{0} makes an Automaton pull: {1}of{2}({3} )', 
                this, pulledCard.getValueText(), pulledCard.suit, pulledCard);
        }
        this.decisionEngine.automatonPulls(pulledCard, playWindow);
    }

    isInCheckAfterMove(dude, destinationUuid) {
        let clonedGame = this.game.clone();
        const clonedDude = clonedGame.findCardInPlayByUuid(dude.uuid);
        clonedDude.moveToLocation(destinationUuid);
        this.game.simulateSundown(clonedGame);
        return clonedDude.controller.isInCheck();
    }
    
    pickShooter(availableDudes) {
        const sortConditions = [
            Priorities.highestStud(dude => dude.bullets > 1),
            Priorities.highestBullets(),
            Priorities.unbootedCard(),
            Priorities.lowestInfluence()
        ];
        return BaseArchetype.highestPriority(availableDudes, sortConditions);
    }

    chooseCalloutParticipants(leaderCond, markCond) {
        const orderedMarks = this.getOrderedMarks(markCond);
        if(!orderedMarks.length) {
            return {};
        }
        let chosenLeader;
        let chosenMark = orderedMarks.find(mark => {
            const orderedLeaders = this.getOrderedLeaders(card => leaderCond(card) && card.gamelocation === mark.gamelocation, mark);
            if(orderedLeaders.length) {
                chosenLeader = orderedLeaders[0];
                return true;
            }
            return false;
        });
        return { leader: chosenLeader, mark: chosenMark};
    }

    getOrderedLeaders(condition = () => true, mark) {
        const unbootedDudes = this.cardsInPlay.filter(card => card.getType() === 'dude' && !card.booted && condition(card));
        const orderedDudes = this.orderByTargetPriority(unbootedDudes, 'chooseLeader', { mark });
        if(orderedDudes && orderedDudes.length) {
            return orderedDudes;
        }
        return [];
    }

    getOrderedMarks(condition = () => true) {
        const possibleMarks = this.game.filterCardsInPlay(card => condition(card));
        const orderedMarks = this.orderByTargetPriority(possibleMarks, 'chooseMark');
        if(orderedMarks && orderedMarks.length) {
            return orderedMarks;
        }
        return [];
    }

    handlePlayWindow(playWindow) {
        this.makeAutomatonPull(playWindow);
        this.game.queueSimpleStep(() => playWindow.markActionAsTaken(this));
    }

    orderByTargetPriority(targets, gameAction, context) {
        const orderFunc = this.decisionEngine.targetPriorities(gameAction, targets, context);
        if(orderFunc) {
            return orderFunc();
        }
        return targets;
    }

    getCardsToDiscard(number, properties = {}) {
        const discardReflex = this.decisionEngine.programmedReflex('discardFromHand', properties);
        if(discardReflex) {
            return discardReflex(number);
        }
        return [];
    }

    getCardsToDiscardOnNightfall() {
        return this.hand.length ? 
            this.getCardsToDiscard(this.getNumberOfDiscardsAtNightfall(), { forNightfall: true }) : [];
    }

    getCardsToDiscardDownToHandSize() {
        return this.hand.length > this.handSize ? 
            this.getCardsToDiscard(this.hand.length - this.handSize) : [];
    }

    decideCallout(caller, callee) {
        const calloutReflex = this.decisionEngine.programmedReflex('callout');
        if(calloutReflex && calloutReflex(caller, callee)) {
            caller.acceptCallout(callee.controller, callee.uuid);
        } else {
            caller.rejectCallout(callee.controller, callee.uuid);            
        }
    }

    decideJobOpposing(job) {
        const jobOpposeReflex = this.decisionEngine.programmedReflex('jobOppose');
        return jobOpposeReflex && jobOpposeReflex(job);
    }

    decideReacts(card, event) {
        const reactReflex = this.decisionEngine.programmedReflex('react');
        return reactReflex && reactReflex(card, event);
    }

    getDudesToFormPosse(shootout) {
        const joinPosseReflex = this.decisionEngine.programmedReflex('joinPosse');
        if(joinPosseReflex) {
            return joinPosseReflex(shootout);
        }

        return [];
    }

    getDudesToFlee(availableDudes) {
        const fleeReflex = this.decisionEngine.programmedReflex('sendHome', { isFlee: true });
        if(fleeReflex) {
            return fleeReflex(availableDudes);
        }

        return [];
    }

    getCardsToDiscardForUpkeep(cardsWithUpkeep) {
        const upkeepReflex = this.decisionEngine.programmedReflex('upkeepDiscard');
        if(upkeepReflex) {
            return upkeepReflex(cardsWithUpkeep);
        }

        return [];
    }

    getCasualties(casualtyContext, firstCasualty) {
        const casualtyReflex = this.decisionEngine.programmedReflex('assignCasualties');
        if(casualtyReflex) {
            return casualtyReflex(casualtyContext, firstCasualty);
        }

        return [];
    }
}

module.exports = Automaton;

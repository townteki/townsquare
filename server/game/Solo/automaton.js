
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

    discardFromHand(number = 1, callback = () => true, options = {}, context) {
        let updatedOptions = Object.assign({ discardExactly: false }, options);
        const cardsToDiscard = this.getCardsToDiscard(number, updatedOptions);
        if(updatedOptions.discardExactly && cardsToDiscard.length !== number) {
            return;
        }
        this.discardCards(cardsToDiscard, false, discarded => {
            callback(discarded);
        }, updatedOptions, context);
    }

    selectScientistToInvent() {
        // TODO M2 solo - update this once there will be Automaton rules for this
        super.selectScientistToInvent();
    }

    finalizeDrawHand(handResult) {
        if(this.drawHand.length > 5) {
            const cardsToDiscard = this.drawHand.filter(drawCard => 
                !handResult.getHandRank().cards.map(card => card.uuid).includes(drawCard.uuid));
            this.discardCards(cardsToDiscard, false, () =>
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

    handlePlayWindow(playWindow) {
        this.makeAutomatonPull(playWindow);
        this.game.queueSimpleStep(() => playWindow.markActionAsTaken(this));
    }

    // TODO M2 solo - implement targeting priorities
    orderByTargetPriority(targets, gameAction) {
        const orderFunc = this.decisionEngine.targetPriorities(gameAction, targets);
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

    getCardsToDiscardOnSundown() {
        return this.hand.length ? 
            this.getCardsToDiscard(this.getNumberOfDiscardsAtSundown(), { forSundown: true }) : [];
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

    getCasualtiesResolution(shootout, casualtiesNum, firstCasualty, context) {
        let availableVictims = shootout.getPosseByPlayer(this).getCards(card => {
            context.casualty = card;
            return card.coversCasualties('any', context);
        });
        let currentCasualtiesNum = casualtiesNum;
        let resolutions = [];
        // 1. check if there are any cards that has to be selected as first casualty
        const handleFirstCasualty = (type) => {
            let fcCoveredNum = firstCasualty.coversCasualties(type);
            if(currentCasualtiesNum - fcCoveredNum >= 0) {
                resolutions.push({
                    card: firstCasualty,
                    type: type
                });
                currentCasualtiesNum -= fcCoveredNum;
                availableVictims = availableVictims.filter(victim => victim !== firstCasualty);
                return true;
            }
            return false;           
        };
        if(availableVictims.includes(firstCasualty)) {
            handleFirstCasualty('sendHome') || handleFirstCasualty('discard') || handleFirstCasualty('ace');
        }
        // if casualties are zero by resolving the first casualty, we are done
        if(currentCasualtiesNum === 0) {
            return resolutions;
        }
        // 2. check if there are any sidekick cards that can be selected as casualty
        resolutions = resolutions.concat(availableVictims.reduce((result, victim) => {
            if(!victim.hasKeyword('sidekick') || currentCasualtiesNum === 0) {
                return result;
            }
            currentCasualtiesNum -= victim.coversCasualties('discard');
            result.push({ card: victim, type: 'discard' });
            return result;
        }, []));
        // if casualties are zero by resolving the sidekick, we are done
        if(currentCasualtiesNum === 0) {
            return resolutions;
        }
        // 3. check other cards that can be selected as casualties to resolve rest
        let restOfVictims = availableVictims.filter(victim => !victim.hasKeyword('sidekick'));
        restOfVictims = this.orderByTargetPriority(restOfVictims, 'casualties');
        return resolutions.concat(restOfVictims.reduce((result, victim) => {
            if(currentCasualtiesNum === 0) {
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
                let remain1 = currentCasualtiesNum - info1.covered;
                let remain2 = currentCasualtiesNum - info2.covered;
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
            currentCasualtiesNum -= casualtyInfos[0].covered;
            return result;
        }, []));
    }
}

module.exports = Automaton;

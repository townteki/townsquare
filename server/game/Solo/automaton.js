
const uuid = require('uuid');
const AbilityContext = require('../AbilityContext.js');
const AttachmentPrompt = require('../gamesteps/attachmentprompt.js');
const PlayActionPrompt = require('../gamesteps/playactionprompt.js');

const JokerPrompt = require('../gamesteps/jokerprompt.js');
const Player = require('../player.js');
const GunfighterArchetype = require('./Archetypes/GunfighterArchetype.js');
const HandResult = require('../handresult.js');
const Priorities = require('./priorities.js');
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
        let defaultOptions = {
            discardExactly: false
        };
        let updatedOptions = Object.assign(defaultOptions, options);
        this.game.promptForSelect(this, {
            promptTitle: updatedOptions.title,
            numCards: number,
            multiSelect: true,
            activePromptTitle: updatedOptions.activePromptTitle || 
                number > 1 ? 'Select cards to discard' : 'Select a card to discard',
            waitingPromptTitle: updatedOptions.waitingPromptTitle || 'Waiting for opponent to discard card(s)',
            cardCondition: card => card.location === 'hand' && card.controller === this &&
                (!options.condition || options.condition(card)),
            onSelect: (p, cards) => {
                if(updatedOptions.discardExactly && cards.length !== number) {
                    return false;
                }
                this.discardCards(cards, false, discarded => {
                    callback(discarded);
                }, updatedOptions, context);
                return true;
            },
            source: updatedOptions.source
        });
    }

    playCard(card, arg) {
        if(!card) {
            return false;
        }

        let cardToUpgrade = this.findUpgrade(card);

        let context = new AbilityContext({
            game: this.game,
            player: this,
            source: card,
            cardToUpgrade: cardToUpgrade
        });
        var playActions = card.getPlayActions(arg).filter(action =>
            action.meetsRequirements(context) && action.canPayCosts(context) && action.canResolveTargets(context));

        if(playActions.length === 0) {
            return false;
        }

        if(playActions.length === 1) {
            context.ability = playActions[0];
            this.game.resolveAbility(playActions[0], context);
        } else {
            this.game.queueStep(new PlayActionPrompt(this.game, this, playActions, context));
        }

        return true;
    }

    putIntoPlay(card, params = {}) {
        const defaultParams = {
            originalLocation: card.location,
            playingType: params.playingType || 'play',
            target: params.targetLocationUuid || '',
            context: params.context || {},
            booted: !!params.booted
        };
        const updatedParams = Object.assign(params, defaultParams);
        let onAttachCompleted = (card, target, params) => {
            if(params.playingType === 'shoppin') {
                this.game.addMessage('{0} does Shoppin\' to attach {1} to {2}{3}', this, card, target, costText);
            } else {
                this.game.addMessage('{0} brings into play {1} attaching it to {2}{3}', this, card, target, costText);
            }
            this.entersPlay(card, params);
        };

        if(!updatedParams.force && !this.canPutIntoPlay(card, updatedParams)) {
            return;
        }

        card.facedown = false;
        card.booted = params.playingType !== 'setup' && !!card.entersPlayBooted || !!updatedParams.booted;
        let costText = '';
        if(updatedParams.context.costs && updatedParams.context.costs.ghostrock !== undefined && updatedParams.context.costs.ghostrock !== null) {
            costText = ', costing ' + updatedParams.context.costs.ghostrock + ' GR';
        }
        switch(card.getType()) {
            case 'spell':
            case 'goods':
                if(updatedParams.playingType === 'shoppin') {
                    updatedParams.targetParent = updatedParams.context.target;
                }
                if(updatedParams.targetParent && this.canAttach(card, updatedParams.targetParent, updatedParams.playingType)) {
                    this.attach(card, updatedParams.targetParent, updatedParams.playingType, (attachment, target) =>
                        onAttachCompleted(attachment, target, updatedParams), updatedParams.scientist);
                } else {
                    this.game.queueStep(new AttachmentPrompt(this.game, this, card, updatedParams, (attachment, target, params) =>
                        onAttachCompleted(attachment, target, params)));
                }
                break;
            case 'dude':
                if(updatedParams.context && updatedParams.context.cardToUpgrade) {
                    updatedParams.context.cardToUpgrade.upgrade(card);
                } else {
                    const putIntoPlayFunc = target => {
                        card.moveToLocation(target);
                        this.moveCard(card, 'play area');
                        this.entersPlay(card, updatedParams);
                        if(updatedParams.playingType === 'shoppin') {
                            if(updatedParams.context && updatedParams.context.cardToUpgrade) {
                                this.game.addMessage('{0} replaces {1} with {2}', this, updatedParams.context.cardToUpgrade, card);
                            } else {
                                this.game.addMessage('{0} does Shoppin\' to hire {1}{2}', this, card, costText);
                            }
                        } else if(this.game.currentPhase !== 'setup') {
                            this.game.addMessage('{0} brings into play dude {1}{2}', this, card, costText);
                        }
                    };
                    if(card.isGadget() && this.game.currentPhase !== 'setup') {
                        this.inventGadget(card, updatedParams.scientist, (context, scientist) => {
                            putIntoPlayFunc(scientist.gamelocation);
                        });
                    } else {
                        let target = updatedParams.target === '' ? this.outfit.uuid : updatedParams.target;
                        putIntoPlayFunc(target);
                    }
                }
                break;
            case 'deed': {
                const putIntoPlayFunc = () => {
                    this.addDeedToStreet(card, updatedParams.target);
                    if(updatedParams.playingType === 'shoppin') {
                        const suffix = (card.hasKeyword('Out of Town') ? 'at out of town location' : 'on their street') + costText;
                        this.game.addMessage('{0} does Shoppin\' to build {1} {2}', this, card, suffix);
                    } else if(this.game.currentPhase !== 'setup') {
                        this.game.addMessage('{0} brings into play deed {1}{2}', this, card, costText);
                    }
                    this.entersPlay(card, updatedParams);                    
                };              
                if(card.isGadget()) {
                    this.inventGadget(card, updatedParams.scientist, () => {
                        putIntoPlayFunc();
                    });
                } else {
                    putIntoPlayFunc();
                }                
                break;
            }
            default:
                //empty
        }
    }

    inventGadget(gadget, scientist, successHandler = () => true) {
        const getPullProperties = (scientist, bootedToInvent) => {
            return {
                successHandler: context => {
                    this.game.addMessage('{0} successfuly invents {1} using {2} ( skill rating {3})', 
                        this, gadget, scientist, context.pull.pullBonus);
                    this.game.raiseEvent('onGadgetInvented', { gadget, scientist, context }, event => {
                        successHandler(event.context, event.scientist);
                    });
                },
                failHandler: context => {
                    this.game.raiseEvent('onGadgetInventFailed', { gadget, scientist, context });
                    this.game.addMessage('{0} fails to invent {1} using {2} ( skill rating {3})', 
                        this, gadget, scientist, context.pull.pullBonus);
                    this.moveCard(gadget, 'discard pile');
                },
                source: gadget,
                pullingDude: scientist,
                bootedToInvent
            };
        };
        const pullToInvent = (scientist, gadget) => {
            let bootedToInvent = false;
            if(!gadget.canBeInventedWithoutBooting()) {
                this.bootCard(scientist);
                bootedToInvent = true;
            }
            this.game.raiseEvent('onGadgetInventing', { gadget, scientist, bootedToInvent }, event => {
                this.pullForSkill(event.gadget.difficulty, event.scientist.getSkillRatingForCard(event.gadget), 
                    getPullProperties(event.scientist, event.bootedToInvent));
            });
        };
        if(!scientist) {
            this.game.promptForSelect(this, {
                activePromptTitle: 'Select a dude to invent ' + gadget.title,
                waitingPromptTitle: 'Waiting for opponent to select dude',
                cardCondition: card => card.location === 'play area' &&
                    card.controller === this &&
                    !card.cannotInventGadgets() &&
                    (!card.booted || gadget.canBeInventedWithoutBooting()) &&
                    card.canPerformSkillOn(gadget),
                cardType: 'dude',
                onSelect: (player, card) => {
                    pullToInvent(card, gadget);
                    return true;
                }
            });
        } else {
            pullToInvent(scientist, gadget);
        }
    }

    // If no callback is passed, pulled card is returned, but if it is joker the
    // value selection if needed has to be handled by the caller.
    // The pulled card has to be taken care of manually afterwards.
    pull(callback, addMessage = false, props = {}) {
        if(this.drawDeck.length === 0) {
            this.shuffleDiscardToDrawDeck();
        }
        const pulledCard = this.drawDeck[0];
        this.moveCard(pulledCard, 'being played');
        if(addMessage) {
            this.game.addMessage('{0} pulled {1}of{2}({3} )', this, pulledCard.getValueText(), pulledCard.suit, pulledCard);
        }
        if(props.context && props.context.ability) {
            this.game.onceConditional('onCardAbilityResolved', { condition: event => event.ability === props.context.ability },
                () => this.handlePulledCard(pulledCard));
        }
        this.game.raiseEvent('onCardPulled', { card: pulledCard, value: pulledCard.value, suit: pulledCard.suit, props }, event => {
            if(callback) {
                if(event.card.getType() === 'joker' && (!event.value || !event.suit)) {
                    this.game.queueStep(new JokerPrompt(this.game, event.card, callback, event.value));
                } else {
                    callback(event.card, event.value, event.suit);
                }
            }
        });
        return pulledCard;
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
        this.game.addMessage('{0} makes an Automaton pull: {1}of{2}({3} )', 
            this, pulledCard.getValueText(), pulledCard.suit, pulledCard);
        this.decisionEngine.automatonPulls(pulledCard, playWindow);
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

    getCardsToDiscardOnSundown() {
        //TODO M2 solo this will use Archetype's Programmed Reflex
        //             for now discard one.
        return this.hand.length ? this.hand.slice(0, 1) : [];
    }

    getCardsToDiscardDownToHandSize() {
        //TODO M2 solo this will use Archetype's Programmed Reflex
        //             for now discard to not exceed hand size.
        return this.hand.length > this.handSize ? this.hand.slice(0, this.hand.length - this.handSize) : [];
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

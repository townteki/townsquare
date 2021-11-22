
const uuid = require('uuid');
const Location = require('./gamelocation.js');
const AbilityContext = require('./AbilityContext.js');
const AttachmentPrompt = require('./gamesteps/attachmentprompt.js');
const DeedStreetSidePrompt = require('./gamesteps/deedstreetsideprompt.js');
const PlayActionPrompt = require('./gamesteps/playactionprompt.js');
const PlayerPromptState = require('./playerpromptstate.js');

const JokerPrompt = require('./gamesteps/jokerprompt.js');
const ReferenceConditionalSetProperty = require('./PropertyTypes/ReferenceConditionalSetProperty.js');
const Player = require('./player.js');

class Automaton extends Player {
    constructor(game, user) {
        super(uuid.v1(), user, false, game);

        this.promptState = new PlayerPromptState();
        this.options = new ReferenceConditionalSetProperty();
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

    redrawFromHand(number = 1, callback = () => true, options = {}, context) {
        this.discardFromHand(number, discardedCards => {
            this.drawCardsToHand(discardedCards.length, context).thenExecute(event => callback(event, discardedCards));
        }, options, context);
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

    addDeedToStreet(card, target) {
        if(card.hasKeyword('Out of Town')) {
            this.locations.push(new Location.GameLocation(this.game, card, null, null));
        } else if(/left/.test(target)) {
            this.addDeedToLeft(card);
        } else if(/right/.test(target)) {
            this.addDeedToRight(card);
        } else {
            this.promptForDeedStreetSide(card);
        }
        this.moveCard(card, 'play area');
    }

    promptForDeedStreetSide(card) {
        this.game.queueStep(new DeedStreetSidePrompt(this.game, this, card, 'play'));
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

    getState(activePlayer) {
        let isActivePlayer = activePlayer === this;
        let promptState = isActivePlayer ? this.promptState.getState() : {};
        let locationsState = this.locations.map(location => {
            return {
                uuid: location.uuid,
                order: location.order
            };
        });

        let state = {
            legend: this.legend ? this.legend.getSummary(activePlayer) : null,
            cardPiles: {
                cardsInPlay: this.getSummaryForCardList(this.cardsInPlay, activePlayer),
                deadPile: this.getSummaryForCardList(this.deadPile, activePlayer).reverse(),
                discardPile: this.getSummaryForCardList(this.discardPile, activePlayer),
                drawDeck: this.getSummaryForCardList(this.drawDeck, activePlayer),
                hand: this.getSummaryForCardList(this.hand, activePlayer),
                drawHand: this.getSummaryForCardList(this.drawHand, activePlayer),
                beingPlayed: this.getSummaryForCardList(this.beingPlayed, activePlayer)
            },
            inCheck: this.currentCheck,
            disconnected: !!this.disconnectedAt,
            outfit: this.outfit.getSummary(activePlayer),
            firstPlayer: this.firstPlayer,
            handRank: this.handResult.rank,
            locations: locationsState,
            id: this.id,
            left: this.left,
            numDrawCards: this.drawDeck.length,
            name: this.name,
            phase: this.game.currentPhase,
            promptedActionWindows: this.promptedActionWindows,
            stats: this.getStats(isActivePlayer),
            keywordSettings: this.keywordSettings,
            timerSettings: this.timerSettings,
            totalControl: this.getTotalControl(),
            totalInfluence: this.getTotalInfluence(),
            user: {
                username: this.user.username
            }
        };

        return Object.assign(state, promptState);
    }

    handlePlayWindow(playWindow) {
        // TODO M2 solo - handle properly once Automaton has decision engine and pulls implemented
        this.game.addAlert('info', '{0}\'s {1} play window', this, playWindow.name);
        playWindow.markActionAsTaken(this);
    }

    // TODO M2 solo - implement targeting priorities
    // eslint-disable-next-line no-unused-vars
    orderByTargetPriority(targets, gameAction) {
        return targets;
    }
}

module.exports = Automaton;

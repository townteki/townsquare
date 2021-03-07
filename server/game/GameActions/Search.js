const GameAction = require('./GameAction');
const AbilityMessage = require('../AbilityMessage');
const CardMatcher = require('../CardMatcher');
const Shuffle = require('./Shuffle');
const Event = require('../event');

class Search extends GameAction {
    constructor({ gameAction, location, match, message, cancelMessage, topCards, numToSelect, player, searchedPlayer, title, handler }) {
        super('search');
        this.gameAction = gameAction;
        this.match = match || {};
        this.topCards = topCards;
        this.numToSelect = numToSelect;
        if(player) {
            this.playerFunc = (() => player);
        } else {
            this.playerFunc = (context => context.player);
        }
        this.searchedPlayerFunc = searchedPlayer || this.playerFunc;
        this.title = title;
        this.location = location || ['draw deck'];
        this.handler = handler;
        if(this.handler && this.gameAction) {
            throw new Error('Search cannot have both `gameAction` and `handler` property.');
        }
        this.message = AbilityMessage.create(message);
        this.cancelMessage = cancelMessage;
    }

    canChangeGameState({ context }) {
        const player = this.searchedPlayerFunc(context);
        return player.drawDeck.length > 0;
    }

    createEvent({ context }) {
        const player = this.playerFunc(context);
        const searchedPlayer = this.searchedPlayerFunc(context);
        return this.event('onDeckSearched', { player, searchedPlayer }, event => {
            const revealFunc = this.createRevealDrawDeckCards({ choosingPlayer: event.player, searchedPlayer: event.searchedPlayer, numCards: this.topCards });
            const searchCondition = this.createSearchCondition(event.searchedPlayer);
            const modeProps = this.numToSelect ? { mode: 'upTo', numCards: this.numToSelect } : {};
            if(this.location.includes('draw deck')) {
                context.game.cardVisibility.addRule(revealFunc);
            }
            context.game.promptForSelect(event.player, Object.assign(modeProps, {
                activePromptTitle: this.title,
                context: context,
                cardCondition: searchCondition,
                onSelect: (player, result) => {
                    context.searchTarget = result;
                    this.message.output(context.game, context);
                    if(this.gameAction) {
                        event.thenAttachEvent(this.gameAction.createEvent(context));
                    }
                    if(this.handler) {
                        let searchTargets = context.searchTarget;
                        if(!Array.isArray(context.searchTarget)) {
                            searchTargets = [context.searchTarget];
                        }
                        searchTargets.forEach(targetCard => {
                            let thenEvent = new Event('onActionOnSearchedCard', { card: targetCard }, event => this.handler(event.card));
                            event.thenAttachEvent(thenEvent);
                        });
                    }
                    return true;
                },
                onCancel: () => {
                    let pilesMessage = context.game.getArrayAsText(this.location);
                    let formattedCancelMessage = AbilityMessage.create(this.cancelMessage || '{player} uses {source} to search their ' + pilesMessage + ' but does not find a card');
                    formattedCancelMessage.output(context.game, context);
                    return true;
                },
                source: context.source
            }));
            if(this.location.includes('draw deck')) {
                context.game.queueSimpleStep(() => {
                    context.game.cardVisibility.removeRule(revealFunc);
                    event.thenAttachEvent(Shuffle.createEvent({ player: event.searchedPlayer }));
                    context.game.addMessage('{0} shuffles their deck', event.searchedPlayer);
                });
            }
        });
    }

    createRevealDrawDeckCards({ choosingPlayer, searchedPlayer, numCards }) {
        if(!this.location.includes('draw deck')) {
            return () => true;
        }
        const validLocations = this.location;
        return function(card, player) {
            if(player !== choosingPlayer) {
                return false;
            }

            if(numCards) {
                let cards = choosingPlayer.searchDrawDeck(numCards);
                return cards.includes(card);
            }

            return validLocations.includes(card.location) && card.controller === searchedPlayer;
        };
    }

    createSearchCondition(player) {
        const match = Object.assign({ location: this.location, controller: player }, this.match);
        const baseMatcher = CardMatcher.createMatcher(match);
        const topCards = this.topCards ? player.searchDrawDeck(this.topCards) : [];

        return (card, context) => {
            if(!baseMatcher(card, context)) {
                return false;
            }

            if(this.topCards && !topCards.includes(card)) {
                return false;
            }

            if(!this.gameAction) {
                return true;
            }

            const result = this.numToSelect ? [card] : card;

            context.searchTarget = result;
            const isActionAllowed = this.gameAction.allow(context);
            context.searchTarget = null;
            return isActionAllowed;
        };
    }
}

module.exports = Search;

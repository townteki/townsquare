const shuffle = require('lodash.shuffle');
const _ = require('underscore');

const Spectator = require('./spectator.js');
const CardMatcher = require('./CardMatcher');
const Deck = require('./Deck');
const HandResult = require('./handresult.js');
const Location = require('./gamelocation.js');
const AtomicEvent = require('./AtomicEvent');
const Event = require('./event');
const AbilityContext = require('./AbilityContext.js');
const AttachmentPrompt = require('./gamesteps/attachmentprompt.js');
const DeedStreetSidePrompt = require('./gamesteps/deedstreetsideprompt.js');
const PlayableLocation = require('./playablelocation.js');
const PlayActionPrompt = require('./gamesteps/playactionprompt.js');
const PlayerPromptState = require('./playerpromptstate.js');
const GameActions = require('./GameActions');
const RemoveFromGame = require('./GameActions/RemoveFromGame');
const GhostRockSource = require('./GhostRockSource.js');

const { UUID, TownSquareUUID, StartingHandSize, StartingDiscardNumber, HereticJokerCodes } = require('./Constants');
const JokerPrompt = require('./gamesteps/jokerprompt.js');
const ReferenceConditionalSetProperty = require('./PropertyTypes/ReferenceConditionalSetProperty.js');
const PhaseNames = require('./Constants/PhaseNames.js');
const MathHelper = require('./MathHelper.js');

/** @typedef {import('./game')} Game */

class Player extends Spectator {
    constructor(id, user, owner, game) {
        super(id, user);

        // Ensure game is set before any cards have been created.
        /** @type {Game} */
        this.game = game;

        //DTR specific
        this.locations = [];

        this.beingPlayed = [];
        this.drawDeck = [];
        this.hand = [];
        this.drawHand = [];
        this.cardsInPlay = [];
        this.deadPile = [];
        this.discardPile = [];
        this.additionalPiles = {};
        this.triggerRestrictions = [];
        this.playCardRestrictions = [];

        this.owner = owner;
        this.rankModifier = 0;
        this.persistentRankModifier = 0;
        this.currentCasualties = 0;
        this.deck = {};
        this.handSize = StartingHandSize;
        this.discardNumber = StartingDiscardNumber;
        this.costReducers = [];
        this.redrawBonus = 0;
        this.control = 0;
        this.maxInfByLocation = 999;
        this.ghostrockSources = [new GhostRockSource(this)];
        this.timerSettings = user.settings.timerSettings || {};
        this.timerSettings.windowTimer = user.settings.windowTimer;
        this.shuffleArray = shuffle;
        this.availableGrifterActions = 1;
        this.currentCheck = false;
        this.resetCheatinResInfo();

        this.createAdditionalPile('out of game');
        this.promptState = new PlayerPromptState();
        this.options = new ReferenceConditionalSetProperty();
    }

    get casualties() {
        if(this.currentCasualties < 0) {
            return 0;
        }
        return this.currentCasualties;
    }

    set casualties(value) {
        this.currentCasualties = value;
    }

    getFaction() {
        if(!this.outfit) {
            return '';
        }
        return this.outfit.gang_code.length && this.outfit.gang_code[0];
    }

    modifyCasualties(amount) {
        this.currentCasualties += amount;
    }

    createAdditionalPile(name, properties = {}) {
        this.additionalPiles[name] = _.extend({ cards: _([]) }, properties);
    }

    createCard(codeOrName) {
        let card = Object.values(this.game.cardData).find(c => {
            return c.title.toLowerCase() === codeOrName.toLowerCase() || c.code === codeOrName;
        });

        if(!card) {
            return false;
        }

        let deck = new Deck();
        return deck.createCard(this, card);
    }

    placeToken(codeOrName, gamelocation, properties = {}) {
        let updatedCodeOrName = codeOrName;
        if(codeOrName.toLowerCase() === 'gunslinger') {
            updatedCodeOrName = this.game.isLegacy() ? '01146' : '24261';
        }
        if(codeOrName.toLowerCase() === 'ancestor spirit') {
            updatedCodeOrName = this.game.isLegacy() ? '09041' : '24260';
        }
        let token = this.createCard(updatedCodeOrName);
        this.game.allCards.push(token);
        token.facedown = !!properties.facedown;
        token.booted = !!properties.booted;
        token.moveToLocation(gamelocation);
        this.moveCard(token, 'play area');
        token.applyPersistentEffects();
        token.controller = this;
        return token;
    }

    isSpectator() {
        return false;
    }

    getOpponent() {
        let opponents = this.game.getOpponents(this);
        if(opponents.length === 0) {
            return { 
                name: 'test player', 
                isCheatin: () => false, 
                modifyGhostRock: () => true,
                equals: player => player.name === 'test player',
                cardsInPlay: [], 
                drawDeck: [],
                hand: [],
                deadPile: []
            };
        }
        return opponents[0];
    }

    getNumberOfDiscardsAtNightfall() {
        return this.discardNumber < 0 ? 0 : this.discardNumber;
    }

    isCardUuidInList(list, card) {
        return list.any(c => {
            return c.uuid === card.uuid;
        });
    }

    areCardsSelected() {
        return this.cardsInPlay.any(card => {
            return card.selected;
        });
    }

    removeCardByUuid(list, uuid) {
        return list.filter(card => card.uuid !== uuid);
    }

    addLocation(location) {
        this.locations.push(location);
    }

    findCardByUuidInAnyList(uuid) {
        return this.findCardByUuid(this.allCards, uuid);
    }

    findCardByUuid(list, uuid) {
        return this.findCard(list, card => card.uuid === uuid);
    }

    findCardInPlayByUuid(uuid) {
        return this.findCard(this.cardsInPlay, card => card.uuid === uuid);
    }

    findCard(cardList, predicate) {
        var cards = this.findCards(cardList, predicate);
        if(!cards || _.isEmpty(cards)) {
            return undefined;
        }

        return cards[0];
    }

    findCards(cardList, predicate) {
        if(!cardList) {
            return;
        }

        var cardsToReturn = [];

        cardList.forEach(card => {
            if(!cardsToReturn.includes(card) && predicate(card)) {
                cardsToReturn.push(card);
            }

            if(card.attachments) {
                cardsToReturn = cardsToReturn.concat(
                    card.attachments.filter(att => !cardsToReturn.includes(att) && predicate(att)));
            }

            return cardsToReturn;
        });

        return cardsToReturn;
    }

    getNumberOfCardsInPlay(predicateOrMatcher) {
        const predicate = typeof(predicateOrMatcher) === 'function'
            ? predicateOrMatcher
            : card => CardMatcher.isMatch(card, predicateOrMatcher);
        return this.game.allCards.reduce((num, card) => {
            if(card.controller.equals(this) && card.location === 'play area' && predicate(card)) {
                return num + 1;
            }

            return num;
        }, 0);
    }

    isCardInPlayableLocation(card, playingType) {
        let playableLocations = ['shoppin', 'play'].map(playingType =>
            new PlayableLocation(playingType, card => card.controller.equals(this) && card.location === 'hand'));
        if(playingType === 'combo') {
            playableLocations.push(new PlayableLocation(playingType, card => 
                card.controller.equals(this) && (card.location === 'hand' || card.location === 'discard pile')));
        }
        return playableLocations.some(location => location.playingType === playingType && location.contains(card));
    }

    modifyGhostRock(amount) {
        // safety reset in case some bug will set ghostrock to null or NaN
        if(!this.ghostrock) {
            this.ghostrock = 0;
        }
        if(amount > 0 && this.cannotGainGhostRock) {
            this.addMessage('{0} cannot gain GR', this);
            return;
        }

        this.ghostrock += amount;

        if(this.ghostrock < 0) {
            amount += -this.ghostrock;
            this.ghostrock = 0;
        }
        this.game.raiseEvent('onStatChanged', { player: this, stat: 'ghostrock', amount });

        return amount;
    }

    resetCheatinResInfo() {
        this.maxAllowedCheatin = 1;
        this.numCheatinPlayed = 0;
    }

    incrementCheatinResPlayed() {
        this.numCheatinPlayed += 1;
    }

    canPlayCheatinResolution() {
        if(this.maxAllowedCheatin <= this.numCheatinPlayed) {
            return false;
        }
        return this.getOpponent().isCheatin();
    }

    isCheatin() {
        return this.getHandRank() && this.getHandRank().cheatin;
    }

    getNumCardsToDraw(amount) {
        let numCards = amount;

        if(numCards > this.drawDeck.length) {
            numCards = this.drawDeck.length;
        }

        return numCards;
    }

    discardDrawHand() {
        this.game.raiseEvent('onDrawHandDiscarded', { player: this }, () => {
            if(this.drawHandRevealed) {
                this.drawHand.forEach(card => {
                    if(card.getType() === 'joker' && !HereticJokerCodes.includes(card.code)) {
                        this.game.resolveGameAction(GameActions.aceCard({ card: card }));
                    }
                });
            }
            let handToDiscard = this.drawHand.filter(card => 
                card.getType() !== 'joker' || HereticJokerCodes.includes(card.code));
            this.discardCards(handToDiscard, discardedCards => {
                this.game.raiseEvent('onAfterDrawHandDiscarded', { discardedCards: discardedCards });
            });

            this.drawHand = [];
            this.drawHandRevealed = false;
            this.drawHandSelected = false;
            this.handResult = new HandResult();
        });
    }

    resetPass() {
        this.pass = false;
    }

    revealDrawHand() {
        this.drawHandRevealed = true;
        this.determineHandResult('reveals');
    }

    determineHandResult(handResultText = 'reveals', doWorst = false) {
        let doLowest = this.game.currentPhase === PhaseNames.Gambling ? !doWorst : doWorst;
        if(this.drawHand.length > 1) {
            this.handResult = new HandResult(this.drawHand, doLowest, false);
        }

        let cheatin = this.isCheatin() ? 'Cheatin\' ' : '';
        let handText = '';
        if(handResultText === 'reveals') {
            handText = ' - ' + this.drawHand.reduce((handText, card) => {
                if(card.getType() === 'joker') {
                    return handText + 'Joker | ';
                }
                return handText + `${card.getValueText()} of ${card.suit} | `;
            }, '');
        }
        let specialJokerText = this.getHandRank().jokerMod > 0 ? '+' : '';
        if(this.getHandRank().specialJoker) {
            specialJokerText += `${this.getHandRank().jokerMod} ${this.getHandRank().specialJoker.title}`;
        }
        this.game.addMessage('{0} {1} {2}{3} (Rank {4}{5}){6}', this, handResultText, cheatin, 
            this.getHandRank().rankName, this.getHandRank().rank, specialJokerText, handText);
        this.game.raiseEvent('onHandResultDetermined', { player: this });
    }

    drawCardsToHand(numCards = 1, context, reason) {
        return this.game.resolveGameAction(GameActions.drawCards({
            player: this,
            amount: numCards,
            target: 'hand',
            reason
        }), this.createContext(context));
    }

    drawCardsToDrawHand(numCards = 1, context, reason) {
        return this.game.resolveGameAction(GameActions.drawCards({
            player: this,
            amount: numCards,
            target: 'draw hand',
            reason
        }), this.createContext(context));
    }

    searchDrawDeck(limit, predicate = () => true) {
        let cards = this.drawDeck;

        if(typeof(limit) === 'function') {
            predicate = limit;
        } else {
            if(limit > 0) {
                cards = this.drawDeck.slice(0, limit);
            } else {
                cards = this.drawDeck.slice(limit);
            }
        }

        return cards.filter(predicate);
    }

    shuffleDrawDeck() {
        this.drawDeck = this.shuffleArray(this.drawDeck);
    }

    shuffleDiscardToDrawDeck() {
        if(this.discardPile.length > 0) {
            this.discardPile.forEach(card => {
                this.moveCard(card, 'draw deck');
            });

            this.shuffleDrawDeck();
            this.game.addAlert('info', '{0} shuffles their discard pile to make a draw deck', this);
        }
    }

    discardFromDrawDeck(number, callback = () => true, options = {}) {
        number = Math.min(number, this.drawDeck.length);

        var cards = this.drawDeck.slice(0, number);
        this.discardCards(cards, discarded => {
            callback(discarded);
        }, options);
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
            cardCondition: card => card.location === 'hand' && card.controller.equals(this) &&
                (!options.condition || options.condition(card)),
            onSelect: (p, cards) => {
                if(updatedOptions.discardExactly && cards.length !== number) {
                    return false;
                }
                this.discardCards(cards, discarded => {
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

    discardAtRandom(number, callback = () => true, showMessage = true) {
        var toDiscard = Math.min(number, this.hand.length);
        var cards = [];

        if(toDiscard <= 0) {
            return false;
        }

        while(cards.length < toDiscard) {
            var cardIndex = MathHelper.randomInt(this.hand.length);

            var card = this.hand[cardIndex];
            if(!cards.includes(card)) {
                cards.push(card);
            }
        }

        this.discardCards(cards, discarded => {
            if(showMessage) {
                this.game.addMessage('{0} discards {1} at random', this, discarded);
            }
            callback(discarded);
        });

        return true;
    }

    resetCardPile(pile) {
        for(const card of pile) {
            if(pile !== this.cardsInPlay || !this.cardsInPlayBeforeSetup.includes(card)) {
                card.moveTo('draw deck');
                this.drawDeck.push(card);
            }
        }
    }

    resetDrawDeck() {
        this.resetCardPile(this.hand);
        this.hand = [];

        this.resetCardPile(this.cardsInPlay);
        this.cardsInPlay = this.cardsInPlay.filter(card => this.cardsInPlayBeforeSetup.includes(card));

        this.resetCardPile(this.discardPile);
        this.discardPile = [];

        this.resetCardPile(this.deadPile);
        this.deadPile = [];
    }

    prepareDecks() {
        var deck = new Deck(this.deck);
        var preparedDeck = deck.prepare(this);
        this.legend = preparedDeck.legend;
        this.outfit = preparedDeck.outfit;
        this.drawDeck = preparedDeck.drawCards;
        this.allCards = preparedDeck.allCards;
        this.startingPosse = preparedDeck.starting;
        //TODO M2 should add allCards also here?
        this.preparedDeck = preparedDeck;
    }

    addOutfitToTown() {
        //Maybe we don't need to manage a TownSquare object, just treat
        //it as abstract adjacency direction.
        //this.game.townsquare.attach(this.outfit.uuid, this.name);

        var outfit = new Location.GameLocation(this.game, this.outfit, null, 0);
        this.locations.push(outfit);
        this.moveCard(this.outfit, 'play area');
    }

    attachLegendToOutfit() {
        this.attach(this.legend, this.outfit, 'attachLegend');
    }

    getOutfitCard() {
        return this.outfit.locationCard;
    }

    initialise() {
        this.prepareDecks();

        this.addOutfitToTown();

        this.ghostrock = this.outfit.wealth || 0;
        if(this.legend) {
            this.attachLegendToOutfit();
            this.ghostrock += this.legend.wealth;
        }
        this.handResult = new HandResult();
    }

    redrawToHandSize(reason) {
        this.drawCardsToHand(this.handSize - this.hand.length, null, reason);
    }

    isOverHandsizeLimit() {
        return this.handSize < this.hand.length;
    }

    createOutfitAndLegend() {
        let deck = new Deck(this.deck);
        this.outfit = deck.createOutfitCard(this);
        this.legend = deck.createLegendCard(this);
    }

    addCostReducer(reducer) {
        if(!this.costReducers.includes(reducer)) {
            this.costReducers.push(reducer);
        }
    }

    removeCostReducer(reducer) {
        if(this.costReducers.includes(reducer)) {
            reducer.unregisterEvents();
            this.costReducers = this.costReducers.filter(r => r !== reducer);
        }
    }

    getCostReduction(playingType, card, context) {
        let matchingReducers = this.costReducers.filter(reducer => reducer.canReduce(playingType, card, context));
        let reduction = matchingReducers.reduce((memo, reducer) => reducer.getAmount(card) + memo, 0);
        return reduction;
    }

    getReducedCost(playingType, card, context) {
        let baseCost = this.getBaseCost(playingType, card);
        let reducedCost = baseCost - this.getCostReduction(playingType, card, context);
        return Math.max(reducedCost, card.getMinCost());
    }

    getBaseCost(playingType, card) {
        return card.getCost();
    }

    addGhostRockSource(source) {
        this.ghostrockSources.unshift(source);
    }

    removeGhostRockSource(source) {
        this.ghostrockSources = this.ghostrockSources.filter(s => s !== source);
    }

    getSpendableGhostRockSources(spendParams) {
        let activePlayer = spendParams.activePlayer || this.game.currentAbilityContext && this.game.currentAbilityContext.player || this;
        let defaultedSpendParams = Object.assign({ activePlayer: activePlayer, playingType: 'ability' }, spendParams);
        return this.ghostrockSources.filter(source => source.allowSpendingFor(defaultedSpendParams));
    }

    getSpendableGhostRock(spendParams = {}) {
        let validSources = this.getSpendableGhostRockSources(spendParams);
        return validSources.reduce((sum, source) => sum + source.ghostrock, 0);
    }

    markUsedReducers(playingType, card, context) {
        var matchingReducers = this.costReducers.filter(reducer => reducer.canReduce(playingType, card, context));
        for(let reducer of matchingReducers) {
            reducer.markUsed();
            if(reducer.isExpired()) {
                this.removeCostReducer(reducer);
            }
        }
        return matchingReducers;
    }

    isAced(card, checkSelf = true) {
        return card.isUnique() && this.deadPile.some(c => c.title === card.title && (checkSelf || c !== card));
    }

    playablePlayActions(card, playType, context) {
        let cardToUpgrade = this.findUpgrade(card);
        if(!context) {
            context = new AbilityContext({
                game: this.game,
                player: this,
                source: card,
                cardToUpgrade: cardToUpgrade
            });
        } else {
            context.cardToUpgrade = cardToUpgrade;
        }
        return card.getPlayActions(playType).filter(action =>
            action.meetsRequirements(context) && action.canPayCosts(context) && action.canResolveTargets(context));
    }

    playCard(card, arg, options = {}) {
        if(!card) {
            return false;
        }

        let context = new AbilityContext({
            game: this.game,
            player: this,
            source: card
        });
        var playActions = this.playablePlayActions(card, arg, context);
        if(playActions.length === 0) {
            return false;
        }
        playActions.forEach(playAction => playAction = Object.assign(playAction.options || {}, { options }));

        if(playActions.length === 1) {
            context.ability = playActions[0];
            this.game.resolveAbility(playActions[0], context);
        } else {
            this.game.queueStep(new PlayActionPrompt(this.game, this, playActions, context));
        }

        return true;
    }

    getPossibleComboCard() {
        let kfDudes = this.cardsInPlay.filter(card => card.getType() === 'dude' && card.isKungFu());
        if(!kfDudes) {
            return;
        }
        for(let kfDude of kfDudes) {
            let techniqueCards = kfDude.getAttachmentsByKeywords(['technique']);
            if(techniqueCards && techniqueCards.length > 0) {
                return techniqueCards.find(techCard => techCard.isTaoTechnique() && !techCard.booted);
            }
        }
    }

    checkAndPerformCombo() {
        const comboCard = this.getPossibleComboCard();
        if(!comboCard) {
            return;
        }
        this.bootCard(comboCard);
        const comboAbility = comboCard.getComboAbility();
        if(!comboAbility) {
            return;
        }
        comboAbility.performCombo({
            game: this.game,
            player: this,
            kfDude: comboCard.parent,
            comboNumber: comboCard.parent.getAttachmentsByKeywords(['technique']).length - 1,
            source: comboCard
        });  
    }

    isAllowed(card, triggerPlayer = 'controller') {
        if(triggerPlayer === 'any') {
            return true;
        }
        if(triggerPlayer === 'owner') {
            return card.owner.equals(this);
        }
        return card.controller.equals(this) || card.canUseControllerAbilities(this);
    }

    hasCardsToDraw() {
        return this.drawDeck.length || this.discardPile.length;
    }

    canTrigger(card) {
        return !this.triggerRestrictions.some(restriction => restriction(card));
    }

    canPlay(card, playingType = 'play') {
        return !this.playCardRestrictions.some(restriction => restriction(card, playingType));
    }

    canPutIntoPlay(card, params = {}) {
        if(card.location === 'discard pile' && this.cardsCannotLeaveDiscard(params.context)) {
            this.game.addMessage('{0} cannot put {1} into play because cards cannot leave discard pile', this, card);
            return false;
        }

        if(card.getType() === 'action') {
            return false;
        }

        if(!params.isEffectExpiration && !this.canPlay(card, params.playingType)) {
            return false;
        }

        if(card.hasKeyword('gadget') && params.playingType === 'shoppin') {
            let availableScientist = this.cardsInPlay.find(searchCard =>
                searchCard.getType() === 'dude' && searchCard.canPerformSkillOn(card) && !searchCard.booted && searchCard.isInControlledLocation());
            if(!availableScientist) {
                return false;
            }
        }

        if(params.context && params.context.cardToUpgrade) {
            return true;
        }

        return this.canControl(card, true);
    }

    canControl(card, puttingIntoPlay = false) {
        if(!card.isUnique()) {
            return true;
        }

        if(this.isAced(card, !puttingIntoPlay)) {
            return false;
        }

        if(card.owner === this) {
            return !this.game.anyCardsInPlay(c => 
                c !== card &&
                c.title === card.title && 
                c.owner === this &&
                !c.facedown
            );
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
                    this.game.addMessage('{0} replaces {1} with {2}', this, updatedParams.context.cardToUpgrade, card);
                } else {
                    const putIntoPlayFunc = target => {
                        card.moveToLocation(target);
                        this.moveCard(card, 'play area');
                        this.entersPlay(card, updatedParams);
                        if(updatedParams.playingType === 'shoppin') {
                            this.game.addMessage('{0} does Shoppin\' to hire {1}{2}', this, card, costText);
                        } else if(this.game.currentPhase !== 'setup') {
                            this.game.addMessage('{0} brings into play dude {1}{2}', this, card, costText);
                        }
                    };
                    if(card.isGadget() && this.game.currentPhase !== 'setup' && updatedParams.playingType !== 'drop') {
                        this.inventGadget(card, updatedParams.scientist, (context, scientist) => {
                            putIntoPlayFunc(scientist.gamelocation);
                        }, scientist => scientist.locationCard.controller.equals(this));
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
                if(card.isGadget() && this.game.currentPhase !== 'setup' && updatedParams.playingType !== 'drop') {
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

    entersPlay(card, params) {
        if(!card.controller.equals(this)) {
            card.controller.allCards = card.controller.allCards.filter(c => c !== card);
            this.allCards.push(card);
        }
        card.controller = this;
        card.entersPlay();
        card.applyPersistentEffects();
        if(!params.context || !params.context.cardToUpgrade) {
            this.game.raiseEvent('onCardEntersPlay', {
                card: card,
                player: this,
                originalLocation: params.originalLocation,
                playingType: params.playingType,
                target: params.target,
                context: params.context
            });
        }
    }

    findUpgrade(card) {
        if(card.getType() !== 'dude') {
            return false;
        }
        const getTitle = rawTitle => {
            let pattern = '(.+)[ ]?\\(Exp\\.[0-9]\\)?';
            let match = rawTitle.match(pattern);
            if(match) {
                return match[1].trim();
            }
            return rawTitle;
        };
        const cardTitle = getTitle(card.title.trim());

        return this.cardsInPlay.find(cardInPlay => {
            if(getTitle(cardInPlay.title) === cardTitle) {
                let cardInPlayExp = cardInPlay.keywords.getExperienceLevel();
                let cardToPlayExp = card.keywords.getExperienceLevel();
                return Math.abs(cardInPlayExp - cardToPlayExp) === 1;
            }
            return false;
        });
    }

    inventGadget(gadget, scientist, successHandler = () => true, scientistCondition = () => true) {
        if(!scientist) {
            this.selectScientistToInvent(gadget, successHandler, scientistCondition);
        } else {
            this.pullToInvent(scientist, gadget, successHandler);
        }
    }

    selectScientistToInvent(gadget, successHandler, scientistCondition = () => true) {
        this.game.promptForSelect(this, {
            activePromptTitle: 'Select a dude to invent ' + gadget.title,
            waitingPromptTitle: 'Waiting for opponent to select dude',
            cardCondition: card => card.location === 'play area' &&
                card.controller.equals(this) &&
                !card.cannotInventGadgets() &&
                (!card.booted || gadget.canBeInventedWithoutBooting()) &&
                card.canPerformSkillOn(gadget) &&
                scientistCondition(card),
            cardType: 'dude',
            onSelect: (player, card) => {
                this.pullToInvent(card, gadget, successHandler);
                return true;
            }
        });
    }

    pullToInvent(scientist, gadget, successHandler) {
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
        let bootedToInvent = false;
        if(!gadget.canBeInventedWithoutBooting()) {
            this.bootCard(scientist);
            bootedToInvent = true;
        }
        this.game.raiseEvent('onGadgetInventing', { gadget, scientist, bootedToInvent }, event => {
            this.pullForSkill(event.gadget.difficulty, event.scientist.getSkillForCard(event.gadget), 
                getPullProperties(event.scientist, event.bootedToInvent));
        });
    }

    canAttach(attachment, card, playingType) {
        if(!attachment || !card || card === attachment) {
            return false;
        }

        if(card.location !== 'play area' && playingType !== 'technique') {
            return false;
        }

        if(!attachment.canAttach(this, card, playingType)) {
            return false;
        }

        if(playingType === 'shoppin') {
            if(!card.locationCard || !card.locationCard.controller.equals(attachment.controller)) {
                return false;
            } 
            if(card.booted && (attachment.getType() !== 'spell' || !attachment.isTotem()) && !attachment.isImprovement()) {
                return false;
            }
        }

        return true;
    }

    attach(attachment, card, playingType, attachCallback, defaultScientist) {
        if(!card || !attachment || !this.canAttach(attachment, card, playingType)) {
            return false;
        }

        if(attachment.getType() !== 'legend' && attachment.isGadget() && 
            ['shoppin', 'ability', 'play'].includes(playingType) &&
            !attachment.doesNotHaveToBeInvented() &&
            attachment.location !== 'play area') {
            let scientist = defaultScientist || 
                (playingType === 'shoppin' && !attachment.isImprovement() ? card : null);
            this.inventGadget(attachment, scientist, () => this.performAttach(attachment, card, playingType, attachCallback));
        } else {
            this.performAttach(attachment, card, playingType, attachCallback);
        }

        return true;
    }

    performAttach(attachment, card, playingType, attachCallback) {
        let originalLocation = attachment.location;
        let originalParent = attachment.parent;

        if(!attachment.controller.equals(card.controller)) {
            this.game.takeControl(card.controller, attachment);
        }

        if(originalLocation !== card.location && playingType !== 'upgrade') {
            attachment.owner.removeCardFromPile(attachment);
        }

        if(originalParent) {
            originalParent.removeAttachment(attachment);
        }
        if(originalLocation !== 'play area') {
            attachment.owner.cardsInPlay.push(attachment);
        }
        attachment.moveTo('play area', true, card);
        card.attachments.push(attachment);
        if(attachCallback) {
            attachCallback(attachment, card, playingType);
        }
        if(playingType === 'trading') {
            attachment.traded = true;
        }

        this.game.queueSimpleStep(() => {
            attachment.applyPersistentEffects();
        });

        if(playingType !== 'upgrade' && playingType !== 'chatcommand') {
            let event = new AtomicEvent();
            if(originalLocation === 'hand') {
                event.addChildEvent(new Event('onCardLeftHand', { player: this, card: card }));
            }

            event.addChildEvent(new Event('onCardAttached', { attachment: attachment, target: card }));

            this.game.resolveEvent(event);
        }
    }

    setDrawDeckVisibility(value) {
        this.showDeck = value;
    }

    getSourceList(source) {
        switch(source) {
            case 'being played':
                return this.beingPlayed;
            case 'hand':
                return this.hand;
            case 'draw hand':
                return this.drawHand;
            case 'draw deck':
                return this.drawDeck;
            case 'discard pile':
                return this.discardPile;
            case 'dead pile':
                return this.deadPile;
            case 'play area':
                return this.cardsInPlay;
            default:
                if(this.additionalPiles[source]) {
                    return this.additionalPiles[source].cards;
                }
        }
    }

    updateSourceList(source, targetList) {
        switch(source) {
            case 'being played':
                this.beingPlayed = targetList;
                return;
            case 'hand':
                this.hand = targetList;
                break;
            case 'draw hand':
                this.drawHand = targetList;
                break;
            case 'draw deck':
                this.drawDeck = targetList;
                break;
            case 'discard pile':
                this.discardPile = targetList;
                break;
            case 'dead pile':
                this.deadPile = targetList;
                break;
            case 'play area':
                this.cardsInPlay = targetList;
                break;
            default:
                if(this.additionalPiles[source]) {
                    this.additionalPiles[source].cards = targetList;
                }
        }
    }

    startPosse() {
        this.hand.forEach(card => {
            if(!['goods', 'spell', 'action', 'joker'].includes(card.getType())) {
                this.game.drop(this.name, card.uuid, 'play area', this.outfit.uuid);
                let reducedCost = this.getReducedCost('setup', card, this.createContext());
                this.ghostrock -= reducedCost;
            }
        });

        this.posse = true;
        this.readyToStart = true;
    }

    receiveProduction() {
        let producers = this.game.findCardsInPlay(card => card.production > 0);
        let production = producers.reduce((memo, card) => {
            if(card.productionToBeReceivedBy === this || (!card.productionToBeReceivedBy && card.controller.equals(this))) {
                let partialProduction = card.production;
                if(card.isLocationCard()) {
                    partialProduction = card.receiveProduction(this);
                }
                return (memo += partialProduction);
            }
            return memo;
        }, 0);

        return production;
    }

    determineUpkeep(selectedCards = []) {
        let upkeepCards = this.game.findCardsInPlay(card => card.controller.equals(this) && 
            card.upkeep > 0 && !selectedCards.includes(card));
        let upkeep = upkeepCards.reduce((memo, card) => {
            return memo + card.upkeep;
        }, 0);

        return upkeep;
    }

    payUpkeep(upkeep = null) {
        if(upkeep === null || upkeep === undefined) {
            upkeep = this.determineUpkeep();
        }
        this.upkeepPaid = true;
        this.ghostrock -= upkeep;
    }

    spendGhostRock(amount) {
        this.game.spendGhostRock({ amount: amount, player: this });
    }

    resetForRound() {
        this.upkeepPaid = false;
        this.passTurn = false;
        this.currentCheck = false;
        this.cardsInPlay.forEach(card => card.resetForRound());
        if(this.resetTimerAtEndOfRound) {
            this.noTimer = false;
        }
    }

    getHandRank() {
        return this.handResult.getHandRank();
    }

    getTotalRank() {
        let totalRank = this.getHandRank().rank + this.getHandRank().jokerMod + this.rankModifier;
        if(totalRank < 1) {
            return 1;
        }
        if(totalRank > 11) {
            return 11;
        }
        return totalRank;
    }

    modifyRank(amount, context, applying = true, fromEffect = false) {
        if(applying && this.cannotModifyHandRanks(context)) {
            if(!fromEffect) {
                let modifyText = '{0}\'s rank could not be modified';
                if(context) {
                    modifyText += ' by {1}';
                }
                this.game.addMessage(modifyText, this, context.source);
            }
            return false;
        }

        this.rankModifier += amount;
        if(fromEffect) {
            this.persistentRankModifier += amount;
        }
        this.game.raiseEvent('onHandRankModified', { player: this, amount: amount});
        return true;
    }

    modifyPosseBonus(amount, type = 'stud') {
        if(this.game.shootout) {
            let playerPosse = this.game.shootout.getPosseByPlayer(this);
            if(playerPosse) {
                if(type === 'stud') {
                    playerPosse.studBonus += amount;
                }
                if(type === 'draw') {
                    playerPosse.drawBonus += amount;
                }
            }
        }
    }

    modifyPosseShooterBonus(amount) {
        if(this.game.shootout) {
            let playerPosse = this.game.shootout.getPosseByPlayer(this);
            if(playerPosse) {
                playerPosse.shooterBonus += amount;
            }
        }
    }

    addCasualties(number) {
        this.casualties += number;
    }

    coverCasualties(number) {
        this.casualties -= number;
        if(this.casualties < 0) {
            this.casualties = 0;
        }
    }

    leftmostLocation() {
        let sorted = _.sortBy(this.locations.filter(location => location.order !== null && location.order !== undefined), 'order');
        return sorted.shift();
    }

    rightmostLocation() {
        let sorted = _.sortBy(this.locations.filter(location => location.order !== null && location.order !== undefined), 'order');
        return sorted.pop();
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

    addDeedToLeft(card) {
        let leftDeed = this.leftmostLocation();
        let newLocation = new Location.GameLocation(this.game, card, leftDeed, leftDeed.order - 1);
        this.locations.push(newLocation);
    }

    addDeedToRight(card) {
        let rightDeed = this.rightmostLocation();
        let newLocation = new Location.GameLocation(this.game, card, rightDeed, rightDeed.order + 1);
        this.locations.push(newLocation);
    }

    removeDeedFromPlay(card, dudeAction) {
        const gameLocation = card.getGameLocation();
        if(!gameLocation) {
            return;
        }
        gameLocation.getDudes().forEach(dude => dudeAction(dude));
        gameLocation.adjacencyMap.forEach((value, key) => {
            const gl = key === TownSquareUUID ? this.game.townsquare : this.findLocation(key);
            if(gl && gl.adjacencyMap.has(gameLocation.uuid)) {
                gl.adjacencyMap.delete(gameLocation.uuid);
            }
        });
        this.game.queueSimpleStep(() => {
            let outOfTownLocations = this.locations.filter(loc => loc.isOutOfTown());
            this.locations = this.locations.filter(loc => loc !== gameLocation && !loc.isOutOfTown());
            if(!card.isOutOfTown()) {
                const orderedLocations = this.locations.sort((a, b) => {
                    return a.order - b.order;
                });
                let rightOrder = 0;
                for(let i = 0; i < orderedLocations.length; i++) {
                    if(orderedLocations[i].order === 0) {
                        let leftOrder = 0;
                        rightOrder = 1;
                        for(let j = i - 1; j >= 0; j--) {
                            leftOrder -= 1;
                            orderedLocations[j].order = leftOrder;                     
                        }
                    }
                    if(i < (orderedLocations.length - 1)) {
                        const gap = Math.abs(orderedLocations[i].order - orderedLocations[i + 1].order);
                        if(gap > 1) {
                            orderedLocations[i].addAdjacency(orderedLocations[i + 1], 'game');
                        }
                        if(rightOrder > 0) {
                            orderedLocations[i].order = rightOrder;
                            rightOrder += 1;
                        }
                    }
                }
            } else {
                outOfTownLocations = outOfTownLocations.filter(ootLoc => ootLoc !== gameLocation);
            }
            this.locations = this.locations.concat(outOfTownLocations);
        });
    }

    promptForDeedStreetSide(card) {
        this.game.queueStep(new DeedStreetSidePrompt(this.game, this, card, 'play'));
    }

    inPlayLocation(target) {
        if(UUID.test(target) || target === TownSquareUUID || /street/.test(target)) {
            return true;
        }
    }

    aceCard(card, options, context) {
        this.aceCards([card], () => true, options, context);
    }

    aceCards(cards, callback = () => true, options, context) {
        let action = GameActions.simultaneously(
            cards.map(card => GameActions.aceCard({
                card,
                options
            }))
        );
        let event = this.game.resolveGameAction(action, this.createContext(context));
        event.thenExecute(() => {
            let cards = event.childEvents.map(childEvent => childEvent.card);
            callback(cards);
        });

        return event;
    }

    discardCard(card, options, context) {
        this.discardCards([card], () => true, options, context);
    }

    discardCards(cards, callback = () => true, options, context) {
        let action = GameActions.simultaneously(
            cards.map(card => GameActions.discardCard({
                card,
                originalLocation: cards[0].location,
                options
            }))
        );
        let event = this.game.resolveGameAction(action, this.createContext(context));
        event.thenExecute(() => {
            let cards = event.childEvents.map(childEvent => childEvent.card);
            callback(cards);
        });

        return event;
    }

    drawDeckAction(amount, cardCallback) {
        let remainder = 0;
        const actualAmount = this.getNumCardsToDraw(amount);
        let cards = this.drawDeck.slice(0, actualAmount);
        if(actualAmount < amount) {
            remainder = amount - actualAmount;
        }

        for(const card of cards) {
            cardCallback(card);
        }

        if(remainder > 0) {
            this.shuffleDiscardToDrawDeck();
            let remainingCards = this.drawDeck.slice(0, remainder);
            for(const card of remainingCards) {
                cardCallback(card);
            }
            cards = _.union(cards, remainingCards);
        }

        return cards;
    }

    handlePulledCard(card) {
        if(!card) {
            return;
        }
        this.game.raiseEvent('onPulledCardHandled', { player: this, card }, event => {
            if(event.card.getType() === 'joker' && !HereticJokerCodes.includes(event.card.code)) {
                event.player.aceCard(event.card);
            } else {
                event.player.moveCard(event.card, 'discard pile', { isPull: true });
            }
        });
    }

    handleTaoTechniques(technique, kfDude, isSuccessful) {
        const eventHandler = () => {
            technique.comboTarget = undefined;
            if(technique.location === 'being played' || technique.parent === kfDude) {
                technique.owner.moveCard(technique, technique.actionPlacementLocation);
            }
        };
        this.attach(technique, kfDude, 'technique', () => {
            if(!isSuccessful) {
                this.bootCard(technique);
            }
        });
        if(this.game.shootout) {
            this.game.once('onPlayWindowClosed', eventHandler);
            this.game.once('onShootoutPhaseFinished', () => {
                eventHandler();
                this.game.removeListener('onPlayWindowClosed', eventHandler);
            });            
        } else {
            this.game.once('onPhaseEnded', eventHandler);
        }
    }

    // If no callback is passed, pulled card is returned, but if it is joker the
    // value selection if needed has to be handled by the caller.
    // The pulled card has to be taken care of manually afterwards.
    pull(callback, addMessage = false, props = {}) {
        if(this.drawDeck.length === 0) {
            this.shuffleDiscardToDrawDeck();
        }
        if(this.drawDeck.length === 0) {
            this.game.addAlert('danger', '{0} cannot pull because their deck and discard are empty', this);
            return null;
        }
        const pulledCard = this.drawDeck[0];
        this.moveCard(pulledCard, 'being played');
        if(addMessage) {
            this.game.addMessage('{0} pulled {1}of{2}({3} )', this, pulledCard.getValueText(), pulledCard.suit, pulledCard);
        }
        if(props.context && props.context.ability) {
            this.game.onceConditional('onCardAbilityResolved', { condition: event => event.ability === props.context.ability },
                () => {
                    if(!props.context.pull || !props.context.pull.doNotHandlePulledCard) {
                        this.handlePulledCard(pulledCard);
                    }
                });
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

    handlePull(properties, context) {
        let props = {
            successCondition: properties.successCondition || (() => true),
            successHandler: properties.successHandler || (() => true),
            failHandler: properties.failHandler || (() => true),
            pullingDude: properties.pullingDude,
            pullBonus: properties.pullBonus || 0,
            difficulty: properties.difficulty,
            source: properties.source,
            player: this,
            chatCommandDiff: properties.chatCommandDiff,
            context
        };
        this.pull((pulledCard, pulledValue, pulledSuit) => {
            const totalPullValue = pulledValue + props.pullBonus;
            if(context) {
                context.totalPullValue = totalPullValue;
            }
            if(props.successCondition(totalPullValue)) {
                this.game.addMessage('{0} pulled {1}of{2} ({3}) as check for {4} and succeeded (total pull value = {5})',
                    this, pulledValue, pulledSuit, pulledCard, props.source ? props.source : props.chatCommandDiff, totalPullValue);
                this.game.raiseEvent('onPullSuccess', Object.assign(props, { pulledValue, pulledSuit, pulledCard }), event => {
                    let isAbility = !!context;
                    const pullInfo = { 
                        pulledValue: event.pulledValue, 
                        pulledSuit: event.pulledSuit, 
                        pulledCard: event.pulledCard, 
                        pullBonus: event.pullBonus 
                    };
                    if(isAbility) {
                        context.pull = pullInfo;
                    } else {
                        context = { player: this, source: event.source, pull: pullInfo};
                    }
                    event.successHandler(context);
                    if(!isAbility) {
                        event.pulledCard.owner.handlePulledCard(event.pulledCard);
                    }
                });
            } else {
                this.game.addMessage('{0} pulled {1}of{2} ({3}) as check for {4} and failed (total pull value - {5})',
                    this, pulledValue, pulledSuit, pulledCard, props.source ? props.source : props.chatCommandDiff, totalPullValue);
                this.game.raiseEvent('onPullFail', Object.assign(props, { pulledValue, pulledSuit, pulledCard }), event => {
                    let isAbility = !!context;
                    const pullInfo = { 
                        pulledValue: event.pulledValue, 
                        pulledSuit: event.pulledSuit, 
                        pulledCard: event.pulledCard, 
                        pullBonus: event.pullBonus 
                    };
                    if(isAbility) {
                        context.pull = pullInfo;
                    } else {
                        context = { player: this, source: event.source, pull: pullInfo};
                    }
                    event.failHandler(context);
                    if(!isAbility) {
                        event.pulledCard.owner.handlePulledCard(event.pulledCard);
                    }
                });
            }
        }, false, props);
    }

    pullForSkill(difficulty, skillName, properties, context) {
        const skillRating = properties.pullingDude.getSkillRating(skillName);
        const checkBonus = properties.pullingDude.getSkillCheckBonus(skillName);
        this.game.raiseEvent('onPullForSkill', { 
            player: this, difficulty, skillRating, checkBonus, properties 
        }, event => {
            const props = Object.assign(properties, {
                successCondition: pulledValue => pulledValue >= event.difficulty,
                pullBonus: event.skillRating + event.checkBonus,
                difficulty
            });
            this.handlePull(props, context);
        });
    }

    pullForKungFu(difficulty, properties, context) {
        const props = Object.assign(properties, {
            successCondition: pulledValue => pulledValue <= difficulty,
            pullBonus: 0,
            difficulty
        });
        this.handlePull(props, context);
    }

    returnCardToHand(card, context) {
        return this.game.resolveGameAction(GameActions.returnCardToHand({ card }), this.createContext(context));
    }

    removeCardFromGame(card) {
        return this.game.resolveGameAction(RemoveFromGame, { card, player: this });
    }

    moveCardToTopOfDeck(card) {
        this.game.applyGameAction('moveToTopOfDeck', card, card => {
            this.game.raiseEvent('onCardReturnedToDeck', { player: this, card: card }, event => {
                event.cardStateWhenMoved = card.createSnapshot();
                this.moveCard(card, 'draw deck', {});
            });
        });
    }

    moveCardToBottomOfDeck(card) {
        this.game.applyGameAction('moveToBottomOfDeck', card, card => {
            this.game.raiseEvent('onCardReturnedToDeck', { player: this, card: card }, event => {
                event.cardStateWhenMoved = card.createSnapshot();
                this.moveCard(card, 'draw deck', { bottom: true });
            });
        });
    }

    shuffleCardIntoDeck(card) {
        this.game.applyGameAction('shuffleIntoDeck', card, card => {
            this.moveCard(card, 'draw deck', {}, () => {
                this.shuffleDrawDeck();
            });
        });
    }

    getTotalControl() {
        let controlCards = this.game.findCardsInPlay(card => card.control > 0 && card.controller.equals(this));
        let control = controlCards.reduce((memo, card) => {
            return memo + card.control;
        }, this.control);

        return control;
    }

    getTotalInfluence() {
        let influenceCards = this.game.findCardsInPlay(card => card.getType() === 'dude' && card.influence > 0 && card.controller.equals(this));
        let infByLocation = {};
        let influence = influenceCards.reduce((memo, card) => {
            if(isNaN(infByLocation[card.gamelocation])) {
                infByLocation[card.gamelocation] = 0;
            }
            if(infByLocation[card.gamelocation] + card.influence > this.maxInfByLocation) {
                const diff = this.maxInfByLocation - infByLocation[card.gamelocation];
                infByLocation[card.gamelocation] = this.maxInfByLocation;
                return memo + diff;
            }
            infByLocation[card.gamelocation] += card.influence;
            return memo + card.influence;
        }, 0);

        return influence;
    }

    isInCheck() {
        if(this.game.getNumberOfPlayers() <= 1) {
            return false;
        }
        this.currentCheck = this.getTotalInfluence() < this.getOpponent().getTotalControl();
        return this.currentCheck;
    }

    removeAttachment(attachment) {
        attachment.isBeingRemoved = true;
        attachment.owner.moveCard(attachment, 'discard pile', {}, () => {
            attachment.isBeingRemoved = false;
        });
    }

    selectDeck(deck) {
        this.deck.selected = false;
        this.deck = deck;
        this.deck.selected = true;
    }

    findLocation(locationUuid) {
        return this.locations.find(location => location.uuid === locationUuid);
    }

    getDudesAtLocation(locationUuid, condition) {
        return this.cardsInPlay.filter(card => card.getType() === 'dude' && 
            card.gamelocation === locationUuid &&
            condition(card));
    }

    createContext(context) {
        return context || {
            game: this.game,
            player: this
        };
    }

    moveDude(dude, targetLocationUuid, params = {}) {
        let options = {
            isCardEffect: params.isCardEffect || params.isCardEffect === false ? params.isCardEffect : true,
            moveType: params.moveType || 'default',
            needToBoot: params.needToBoot || params.needToBoot === false ? params.needToBoot : null,
            allowBooted: !!params.allowBooted,
            markActionAsTaken: !!params.markActionAsTaken,
            context: params.context
        };
        let origin = this.game.findLocation(dude.gamelocation);
        let destination = this.game.findLocation(targetLocationUuid);
        let moveMessage = '{0} moves {1} to {2} without booting';
        if(!origin || !destination) {
            return;
        }
        if(origin.uuid === destination.uuid) {
            if(options.needToBoot) {
                this.bootCard(dude);
                if(!options.isCardEffect) {
                    this.game.addMessage('{0} boots {1} without moving', this, dude);
                }
            }
            return;
        }

        const reqToMove = dude.requirementsToMove(origin, destination, options);
        if(!reqToMove.canMove) {
            return;
        }
        options.needToBoot = reqToMove.needToBoot;

        if(options.needToBoot) {
            this.bootCard(dude);
            moveMessage = '{0} boots {1} to move them to {2}';
        }

        dude.moveToLocation(destination.uuid, options);
        if(!options.isCardEffect && !dude.isToken()) {
            this.game.addMessage(moveMessage, this, dude, destination.locationCard);
        }
        if(options.markActionAsTaken) {
            options.context.ability = options.context.ability || { title: 'move '};
            this.game.markActionAsTaken(options.context);
        }
    }

    moveCardWithContext(card, targetLocation, context, showMessage = false) {
        if(card.location === 'discard pile' && this.cardsCannotLeaveDiscard(context)) {
            if(showMessage) {
                this.game.addMessage('{0} cannot put {1} into their hand because cards cannot leave discard pile', this, card);
            }
            return false;
        }        
        this.moveCard(card, targetLocation, {}, null);
        return true;
    }

    moveCard(card, targetLocation, options = {}, callback) {
        if(!targetLocation) {
            return;
        }
        if(card.isToken()) {
            if(card.location === 'out of game') {
                return;
            }
            if(targetLocation !== 'play area') {
                targetLocation = 'out of game';
            }
        }
        this.removeCardFromPile(card);
        let targetPile = this.getSourceList(targetLocation);

        options = Object.assign({ bottom: false, isDupe: false, raiseEvents: true }, options);

        if(!targetPile) {
            return;
        }
        if(targetPile.includes(card) && card.location !== 'play area') {
            return;
        }

        var params = {
            player: this,
            card: card,
            targetLocation,
            originalGameLocation: card.gamelocation
        };

        if(card.location === 'play area') {
            if(card.owner !== this) {
                card.owner.moveCard(card, targetLocation, options, callback);
                return;
            }

            if(targetLocation !== 'play area') {
                let cardLeavePlay = () => {
                    card.leavesPlay();
                    card.moveTo(targetLocation, options.raiseEvents);
                };

                if(options.raiseEvents) {
                    this.game.raiseEvent('onCardLeftPlay', params, () => {
                        cardLeavePlay(card);
                        if(callback) {
                            callback(card);
                        }
                    });
                } else {
                    cardLeavePlay(card);
                }
            }
        }

        if(card.location === 'hand' && options.raiseEvents) {
            this.game.raiseEvent('onCardLeftHand', { player: this, card: card });
        }

        if(card.location !== 'play area') {
            card.moveTo(targetLocation, options.raiseEvents);
        }

        if(['draw deck', 'discard pile', 'being played'].includes(targetLocation) && !options.bottom) {
            targetPile.unshift(card);
        } else {
            targetPile.push(card);
        }

        if(targetLocation === 'hand' && options.raiseEvents) {
            this.game.raiseEvent('onCardEntersHand', { player: this, card: card });
        }

        if(targetLocation === 'draw hand' && options.raiseEvents) {
            this.game.raiseEvent('onCardEntersDrawHand', { player: this, card: card });
        }

        if(['dead pile', 'discard pile'].includes(targetLocation) && options.raiseEvents) {
            this.game.raiseEvent('onCardPlaced', { card: card, location: targetLocation, player: this });
        }
        if(callback) {
            callback(card);
        }
    }

    bootCard(card, context) {
        return this.game.resolveGameAction(GameActions.bootCard({ card }), this.createContext(context));
    }

    bootCards(cards, context, callback = () => true) {
        let action = GameActions.simultaneously(
            cards.map(card => GameActions.bootCard({ card }))
        );
        let event = this.game.resolveGameAction(action, this.createContext(context));
        event.thenExecute(() => {
            let cards = event.childEvents.map(childEvent => childEvent.card);
            callback(cards);
        });

        return event;
    }

    unbootCard(card, options = {}, context) {
        return this.game.resolveGameAction(GameActions.unbootCard({ card, force: options.force }), context);
    }

    placeCardInPile({ card, location, bottom = false }) {
        this.removeCardFromPile(card);

        let targetPile = this.getSourceList(location);

        if(!targetPile) {
            return;
        }

        card.moveTo(location);

        if(location === 'draw deck' && !bottom) {
            targetPile.unshift(card);
        } else {
            targetPile.push(card);
        }
    }

    removeCardFromPile(card) {
        if(!card.controller.equals(this)) {
            card.controller.removeCardFromPile(card);
            this.game.takeControl(card.owner, card, () => card.controller.removeCardFromPile(card));
            return;
        }

        var originalLocation = card.location;
        var originalPile = this.getSourceList(originalLocation);

        if(originalPile) {
            originalPile = this.removeCardByUuid(originalPile, card.uuid);
            this.updateSourceList(originalLocation, originalPile.filter(c => c.uuid !== card.uuid));
        }
    }

    decideCallout(caller, callee) {
        this.game.promptWithMenu(this, caller, {
            activePrompt: {
                menuTitle: 'There has been a Call Out!',
                controls: [{ source: caller.getShortSummary(), targets: [callee.getShortSummary()], type: 'targeting'}],
                buttons: [
                    { text: 'Accept Callout', method: 'acceptCallout', arg: callee.uuid },
                    { text: 'Refuse Callout', method: 'rejectCallout', arg: callee.uuid }
                ]
            },
            waitingPromptTitle: 'Waiting for opponent to decide if they run or fight'
        });        
    }

    braggingRightsScore() {
        if(this.game.getNumberOfPlayers() < 2) {
            return 0;
        }
        let finalScore = 0;
        let braggingRights = {};
        braggingRights.totalCost = this.cardsInPlay.reduce((totalCost, card) => totalCost + (card.cost ? card.cost : 0), 0);
        finalScore += braggingRights.totalCost;
        braggingRights.ghostRock = Math.floor(this.ghostrock / 2);
        finalScore += braggingRights.ghostRock;
        if(this.getTotalControl() > this.getOpponent().getTotalInfluence()) {
            braggingRights.aboveCP = this.getTotalControl() - this.getOpponent().getTotalInfluence();
            finalScore += braggingRights.aboveCP;
        }
        if(this.getTotalInfluence() > this.getOpponent().getTotalControl()) {
            braggingRights.aboveInf = this.getTotalInfluence() - this.getOpponent().getTotalControl();
            finalScore += braggingRights.aboveInf;
        }
        braggingRights.oppDead = this.getOpponent().deadPile.filter(card => card.getType() === 'dude').length * 2;
        finalScore += braggingRights.oppDead;
        braggingRights.myDead = this.deadPile.filter(card => card.getType() === 'dude').length * -4;
        finalScore += braggingRights.myDead;
        braggingRights.numOfDays = this.game.round * -5;
        finalScore += braggingRights.numOfDays;
        braggingRights.finalScore = finalScore;

        return braggingRights;
    }

    setSelectedCards(cards) {
        this.promptState.setSelectedCards(cards);
    }

    clearSelectedCards() {
        this.promptState.clearSelectedCards();
    }

    getSelectableCards() {
        return this.promptState.selectableCards;
    }

    setSelectableCards(cards) {
        this.promptState.setSelectableCards(cards);
    }

    clearSelectableCards() {
        this.promptState.clearSelectableCards();
    }

    getSummaryForCardList(list, activePlayer) {
        var summaryList = list.map(card => {
            var summary = card.getSummary(activePlayer);
            return summary;
        });

        return summaryList;
    }

    getCardSelectionState(card) {
        return this.promptState.getCardSelectionState(card);
    }

    currentPrompt() {
        return this.promptState.getState();
    }

    setPrompt(prompt) {
        this.promptState.setPrompt(prompt);
    }

    cancelPrompt() {
        this.promptState.cancelPrompt();
    }

    getGameElementType() {
        return 'player';
    }

    getStats() {
        return {
            ghostrock: this.ghostrock,
            influence: this.getTotalInfluence(),
            control: this.getTotalControl()
        };
    }

    disableTimerForRound() {
        this.noTimer = true;
        this.resetTimerAtEndOfRound = true;
    }

    isTimerEnabled() {
        return !this.noTimer && this.timerSettings.windowTimer !== 0;
    }

    cannotModifyHandRanks(context = {}) {
        return this.options.contains('cannotModifyHandRanks', context);
    }

    cannotIncreaseCasualties(context = {}) {
        return this.options.contains('cannotIncreaseCasualties', context);
    }

    cannotDecreaseCasualties(context = {}) {
        return this.options.contains('cannotDecreaseCasualties', context);
    }    

    cardsCannotLeaveDiscard(context = {}) {
        return this.options.contains('cardsCannotLeaveDiscard', context);
    }

    dudesCannotFlee() {
        return this.options.contains('dudesCannotFlee');
    }

    bulletBonusesAreSwitched() {
        return this.options.contains('bulletBonusesSwitched');
    }

    onlyShooterContributes() {
        return this.options.contains('onlyShooterContributes');
    }

    otherDudesCannotJoin() {
        return this.options.contains('otherDudesCannotJoin');        
    }

    discardAllDuringNightfall() {
        return this.options.contains('discardAllDuringNightfall');
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
        const effects = this.game.effectEngine.getAppliedEffectsOnTarget(this)
            .filter(effect => effect.effect && effect.effect.title).map(effect => effect.getSummary());

        let state = {
            cardPiles: {
                cardsInPlay: this.getSummaryForCardList(this.cardsInPlay, activePlayer),
                deadPile: this.getSummaryForCardList(this.deadPile, activePlayer).reverse(),
                discardPile: this.getSummaryForCardList(this.discardPile, activePlayer),
                drawDeck: this.getSummaryForCardList(this.drawDeck, activePlayer),
                hand: this.getSummaryForCardList(this.hand, activePlayer),
                drawHand: this.getSummaryForCardList(this.drawHand, activePlayer),
                beingPlayed: this.getSummaryForCardList(this.beingPlayed, activePlayer)
            },
            classType: 'player',
            effects: effects,
            inCheck: this.currentCheck,
            disconnected: !!this.disconnectedAt,
            outfit: this.outfit.getSummary(activePlayer),
            firstPlayer: this.firstPlayer,
            handRank: this.handResult.rank,
            legend: this.legend ? this.legend.getSummary(activePlayer) : null,
            locations: locationsState,
            id: this.id,
            left: this.left,
            numDrawCards: this.drawDeck.length,
            name: this.name,
            phase: this.game.currentPhase,
            stats: this.getStats(isActivePlayer),
            timerSettings: this.timerSettings,
            totalControl: this.getTotalControl(),
            totalInfluence: this.getTotalInfluence(),
            user: {
                username: this.user.username,
                isAutomaton: this === this.game.automaton
            }
        };

        return Object.assign(state, promptState);
    }
}

module.exports = Player;

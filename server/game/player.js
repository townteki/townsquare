const shuffle = require('lodash.shuffle');
const _ = require('underscore');

const Spectator = require('./spectator.js');
const CardMatcher = require('./CardMatcher');
const DrawCard = require('./drawcard.js');
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

const { UUID, TownSquareUUID, StartingHandSize } = require('./Constants');
const GhostRockSource = require('./GhostRockSource.js');

class Player extends Spectator {
    constructor(id, user, owner, game) {
        super(id, user);

        // Ensure game is set before any cards have been created.
        this.game = game;
		
		//DTR specific
		this.locations = []

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
        this.promptedActionWindows = user.promptedActionWindows;
        this.keywordSettings = user.settings.keywordSettings;

        this.rankModifier = 0;
        this.casualties = 0;
        this.deck = {};
        this.handSize = StartingHandSize;
        this.costReducers = [];
        this.ghostrockSources = [new GhostRockSource(this)];
        this.timerSettings = user.settings.timerSettings || {};
        this.timerSettings.windowTimer = user.settings.windowTimer;        
        this.shuffleArray = shuffle;
        this.resetCheatinResInfo();

        this.createAdditionalPile('out of game');
        this.promptState = new PlayerPromptState();
    }

    createAdditionalPile(name, properties = {}) {
        this.additionalPiles[name] = _.extend({ cards: _([]) }, properties);
    }

    createDefaultPlayableLocations() {
        let playFromHand = ['marshal', 'marshalIntoShadows', 'play', 'ambush'].map(playingType => new PlayableLocation(playingType, card => card.controller === this && card.location === 'hand'));
        let playFromShadows = ['outOfShadows', 'play'].map(playingType => new PlayableLocation(playingType, card => card.controller === this && card.location === 'shadows'));
        return playFromHand.concat(playFromShadows);
    }

    isSpectator() {
        return false;
    }

    getOpponent() {
        let opponents = this.game.getOpponents(this);
        if (opponents.length === 0) {
            return { name: 'test player', isCheatin: () => false };
        }
        return opponents[0];
    }

    isCardUuidInList(list, card) {
        return list.any(c => {
            return c.uuid === card.uuid;
        });
    }

    isCardNameInList(list, card) {
        return list.any(c => {
            return c.name === card.name;
        });
    }

    areCardsSelected() {
        return this.cardsInPlay.any(card => {
            return card.selected;
        });
    }

    removeCardByUuid(list, uuid) {
        let result = [];
        for(let card of list) {
            if (card.uuid === uuid) {
                continue;
            }
            result.push(card);
        }

        return result;
        /* TODO M2 just keeping here for reference (list.reject not working)
        return _(list.reject(card => {
            return card.uuid === uuid;
        }));
        */
    }

    addLocation(location) {
        this.locations.push(location);
    }

    findCardByName(list, name) {
        return this.findCard(list, card => card.name === name);
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

        _.each(cardList, (card) => {
            if(predicate(card)) {
                cardsToReturn.push(card);
            }

            if(card.attachments) {
                cardsToReturn = cardsToReturn.concat(card.attachments.filter(predicate));
            }

            return cardsToReturn;
        });

        return cardsToReturn;
    }    

    anyCardsInPlay(predicateOrMatcher) {
        const predicate = typeof(predicateOrMatcher) === 'function'
            ? predicateOrMatcher
            : card => CardMatcher.isMatch(card, predicateOrMatcher);
        return this.game.allCards.some(card => card.controller === this && card.location === 'play area' && predicate(card));
    }

    filterCardsInPlay(predicateOrMatcher) {
        const predicate = typeof(predicateOrMatcher) === 'function'
            ? predicateOrMatcher
            : card => CardMatcher.isMatch(card, predicateOrMatcher);
        return this.game.allCards.filter(card => card.controller === this && card.location === 'play area' && predicate(card));
    }

    getNumberOfCardsInPlay(predicateOrMatcher) {
        const predicate = typeof(predicateOrMatcher) === 'function'
            ? predicateOrMatcher
            : card => CardMatcher.isMatch(card, predicateOrMatcher);
        return this.game.allCards.reduce((num, card) => {
            if(card.controller === this && card.location === 'play area' && predicate(card)) {
                return num + 1;
            }

            return num;
        }, 0);
    }

    isCardInPlayableLocation(card, playingType) {
        return true;
        // TODO M2 check if we need playable locations
        //return this.playableLocations.some(location => location.playingType === playingType && location.contains(card));
    }


    modifyGhostRock(amount) {
        this.ghostrock += amount;

        if(this.ghostrock < 0) {
            amount += -this.ghostrock;
            this.ghostrock = 0;
        }

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
        if (this.maxAllowedCheatin <= this.numCheatinPlayed) {
            return false;
        }
        return this.getOpponent().isCheatin();
    }

    isCheatin() {
        return this.getHandRank() && this.getHandRank().cheatin
    }

    getNumCardsToDraw(amount) {
        let numCards = amount;

        if(numCards > this.drawDeck.length) {
            numCards = this.drawDeck.length;
        }

        return numCards;
    }

    discardDrawHand() {
        this.discardCards(this.drawHand, () => {
            //callback(discarded);
        });

        this.drawHand = [];
        this.drawHandRevealed = false;
        this.drawHandSelected = false;
        this.handResult = new HandResult();
    }

    resetPass() {
        this.pass = false;
    }

    revealDrawHand() {
        if(this.drawHand.length > 1) {
            this.handResult = new HandResult(this.drawHand);
        }  

        this.drawHandRevealed = true;
        let cheatin = this.isCheatin() ? 'Cheatin\' ' : ''
        this.game.addMessage('{0} reveals {1}{2} (Rank {3})', this, cheatin, this.getHandRank().rankName, this.getHandRank().rank);
    }    

    drawCardsToHand(numCards, target = 'hand') {
        return this.game.resolveGameAction(GameActions.drawCards({ player: this, amount: numCards, target: target }));
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
        if(this.discardPile.size() > 0) {
            this.discardPile.each(card => {
                this.moveCard(card, 'draw deck');
            });

            this.shuffleDrawDeck();
        }
    }    

    discardFromDraw(number, callback = () => true, options = {}) {
        number = Math.min(number, this.drawDeck.length);

        var cards = this.drawDeck.slice(0, number);
        this.discardCards(cards, false, discarded => {
            callback(discarded);
        }, options);
    }

    moveFromTopToBottomOfDrawDeck(number) {
        while(number > 0) {
            this.moveCard(this.drawDeck[0], 'draw deck', { bottom: true });

            number--;
        }
    }

    discardAtRandom(number, callback = () => true) {
        var toDiscard = Math.min(number, this.hand.length);
        var cards = [];

        while(cards.length < toDiscard) {
            var cardIndex = Math.floor(Math.random() * this.hand.length);

            var card = this.hand[cardIndex];
            if(!cards.includes(card)) {
                cards.push(card);
            }
        }

        this.discardCards(cards, false, discarded => {
            this.game.addMessage('{0} discards {1} at random', this, discarded);
            callback(discarded);
        });
    }  

    canDraw() {
        return (this.maxCardDraw.getMax() === undefined || this.drawnCards < this.maxCardDraw.getMax());
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

        var outfit = new Location.GameLocation(this.outfit, null, 0);
        this.locations.push(outfit);
        this.moveCard(this.outfit, 'play area');
    }    

    initialise() {
        this.prepareDecks();

        this.addOutfitToTown();

        this.ghostrock = this.outfit.wealth || 0;
        this.handResult = new HandResult();
    }

    startGame() {
        if(!this.readyToStart) {
            return;
        }

        this.shuffleDrawDeck();
        this.drawCardsToHand(StartingHandSize, 'hand');
    }    

    sundownRedraw() {
        this.drawCardsToHand(this.handSize - this.hand.length, 'hand');
    }    

    createOutfitAndLegend() {
        let deck = new Deck(this.deck);
        this.outfit = deck.createOutfitCard(this);
        this.legend = deck.createLegendCard(this);
    }

    addCostReducer(reducer) {
        this.costReducers.push(reducer);
    }

    removeCostReducer(reducer) {
        if(this.costReducers.includes(reducer)) {
            reducer.unregisterEvents();
            this.costReducers = this.costReducers.filter(r => r !== reducer);
        }
    }

    getCostReduction(playingType, card) {
        let matchingReducers = this.costReducers.filter(reducer => reducer.canReduce(playingType, card));
        let reduction = matchingReducers.reduce((memo, reducer) => reducer.getAmount(card) + memo, 0);
        return reduction;
    }

    getReducedCost(playingType, card) {
        let baseCost = this.getBaseCost(playingType, card);
        let reducedCost = baseCost - this.getCostReduction(playingType, card);
        return Math.max(reducedCost, card.getMinCost());
    }

    getBaseCost(playingType, card) {
        if(playingType === 'outOfShadows' || playingType === 'play' && card.location === 'shadows') {
            return card.getShadowCost();
        }

        if(playingType === 'ambush') {
            return card.getAmbushCost();
        }

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

    markUsedReducers(playingType, card) {
        var matchingReducers = this.costReducers.filter(reducer => reducer.canReduce(playingType, card));
        for(let reducer of matchingReducers) {
            reducer.markUsed();
            if(reducer.isExpired()) {
                this.removeCostReducer(reducer);
            }
        }
    }

    isAced(card) {
        return card.isUnique() && this.deadPile.some(c => c.title === card.title);
    }

    playCard(card) {
        if(!card) {
            return false;
        }

        let context = new AbilityContext({
            game: this.game,
            player: this,
            source: card
        });
        var playActions = card.getPlayActions().filter(action => action.meetsRequirements(context) && action.canPayCosts(context) && action.canResolveTargets(context));

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

    canTrigger(card) {
        return !this.triggerRestrictions.some(restriction => restriction(card));
    }

    canPlay(card, playingType = 'play') {
        return !this.playCardRestrictions.some(restriction => restriction(card, playingType));
    }

    canPutIntoPlay(card, params = {}) {
        if(card.getType() === 'action') {
            return false;
        }

        if(!params.isEffectExpiration && !this.canPlay(card, params.playingType)) {
            return false;
        }

        return this.canControl(card);
    }

    canControl(card) {
        let owner = card.owner;

        if(!card.isUnique()) {
            return true;
        }

        if(this.isAced(card)) {
            return false;
        }

        if(owner === this) {
            let controlsAnOpponentsCopy = this.anyCardsInPlay(c => c.title === card.title && c.owner !== this && !c.facedown);
            let opponentControlsOurCopy = this.game.getPlayers().some(player => {
                return player !== this && player.anyCardsInPlay(c => c.title === card.title && c.owner === this && c !== card && !c.facedown);
            });

            return !controlsAnOpponentsCopy && !opponentControlsOurCopy;
        }

        if(owner.isAced(card)) {
            return false;
        }

        let controlsACopy = this.anyCardsInPlay(c => c.title === card.title && !c.facedown);
        let opponentControlsACopy = owner.anyCardsInPlay(c => c.title === card.title && c !== card && !c.facedown);

        return !controlsACopy && !opponentControlsACopy;
    }

    putIntoPlay(card, params = {}) {
        let updatedParams = {
            originalLocation: card.location,
            playingType: params.playingType || 'play',
            target: params.target || '',
            context: params.context || {},
            booted: !!params.booted
        }

        if(!updatedParams.force && !this.canPutIntoPlay(card, updatedParams)) {
            return;
        }

        card.facedown = false;
        card.booted = params.playingType !== 'setup' && !!card.entersPlayBooted || !!updatedParams.booted;
        switch(card.getType()) {
            case 'spell':
            case 'goods':
                this.game.queueStep(new AttachmentPrompt(this.game, this, card, updatedParams, ((card, params) => this.entersPlay(card, params))));
                break;
            case 'dude':  
                let target = updatedParams.playingType === 'shoppin' && updatedParams.target === '' ? this.outfit.uuid : updatedParams.target;
                card.moveToLocation(target);
                this.moveCard(card, 'play area');  
                this.entersPlay(card, updatedParams);
                break;
            case 'deed':
                this.addDeedToStreet(card, updatedParams.target);
                this.entersPlay(card, updatedParams);
                break;
            default:
                //empty
        }    
    }

    entersPlay(card, params) {
        if(card.controller !== this) {
            card.controller.allCards = _(card.controller.allCards.reject(c => c === card));
            this.allCards.push(card);
        }                 
        card.controller = this;
        card.entersPlay();
        card.applyPersistentEffects();
        this.game.raiseEvent('onCardEntersPlay', { 
            card: card, 
            player: this,
            originalLocation: params.originalLocation,
            playingType: params.playingType,
            target: params.target,
            context: params.context
        });     
    }

    revealSetupCards() {
        let processedCards = [];

        for(const card of this.cardsInPlay) {
            card.facedown = false;

            if(!card.isUnique()) {
                processedCards.push(card);
                continue;
            }

            let duplicate = processedCards.find(c => c.name === card.name);

            if(duplicate) {
                duplicate.addDuplicate(card);
            } else {
                processedCards.push(card);
            }
        }

        this.cardsInPlay = processedCards;
    }

    resetForStartOfRound() {
        this.firstPlayer = false;
        this.selectedPlot = undefined;

        if(this.resetTimerAtEndOfRound) {
            this.noTimer = false;
        }

        this.gainedGhostRock = 0;
        this.drawnCards = 0;

        this.limitedPlayed = 0;

        this.bonusesFromRivals.clear();
    }

    hasUnmappedAttachments() {
        return this.cardsInPlay.some(card => {
            return card.getType() === 'attachment';
        });
    }

    canAttach(attachment, card, playingType) {
        if(!attachment || !card) {
            return false;
        }

        if (card.location !== 'play area' || card === attachment || !attachment.canAttach(this, card)) {
            return false;
        }

        if (playingType === 'shoppin' && (card.getLocation().determineController(this.game) !== this) || card.booted) {
            return false;
        }

        return true;
    }

    attach(controller, attachment, card, playingType, facedown = false) {
        if(!card || !attachment || !this.canAttach(attachment, card)) {
            return false;
        }

        let originalLocation = attachment.location;
        let originalParent = attachment.parent;

        attachment.owner.removeCardFromPile(attachment);

        if(originalParent) {
            originalParent.removeAttachment(attachment);
        }
        if(originalLocation != 'play area') {
            attachment.owner.cardsInPlay.push(attachment);
        }
        attachment.moveTo('play area', card);
        card.attachments.push(attachment);
        if (playingType === 'trading') {
            attachment.traded = true;
        }

        this.game.queueSimpleStep(() => {
            attachment.applyPersistentEffects();
        });

        let event = new AtomicEvent();
        if(card.location === 'hand') {
            event.addChildEvent(new Event('onCardLeftHand', { player: this, card: card }));
        }

        event.addChildEvent(new Event('onCardAttached', { attachment: attachment, target: card }));

        if(originalLocation !== 'play area') {
            event.addChildEvent(new Event('onCardEntersPlay', { card: attachment, playingType: playingType, originalLocation: originalLocation }));
        }

        this.game.resolveEvent(event);

        return true;
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
        _.each(this.hand, (card) => {
            this.game.drop(this.name, card.uuid, 'hand', 'play area', this.outfit.uuid);
            this.ghostrock -= card.cost;
        });

        this.posse = true;
        this.readyToStart = true;
    }
    
    receiveProduction() {
        let producers = this.game.findCardsInPlay(card => card.production > 0);
        let production = producers.reduce((memo, card) => {
            if (card.controller === this) {
                let partialProduction = card.production;
                if (card.getType() === 'deed') {
                    partialProduction = card.receiveProduction(this);
                }
                return(memo += partialProduction);
            } else {
                return memo;
            }
        }, 0);

        this.ghostrock += production;

        return production;
    }

    determineUpkeep() {
        let upkeepCards = this.game.findCardsInPlay(card => card.controller === this && 
            (card.upkeep > 0 || (card.gang_code !== this.outfit.gang_code && card.getInfluence() > 0)));
        let upkeep = upkeepCards.reduce((memo, card) => {
            let additionalUpkeep = card.gang_code !== this.outfit.gang_code ? card.getInfluence() : 0;
            return memo + card.upkeep + additionalUpkeep;
        }, 0);

        return upkeep;
    }

    payUpkeep(upkeep = null) {
        if (upkeep === null) {
            upkeep = this.determineUpkeep();
        }
        this.upkeepPaid = true;
        this.ghostrock -= upkeep;
    }

    resetForRound() {
        this.upkeepPaid = false;
        this.passTurn = false;
        this.cardsInPlay.forEach(card => card.resetForRound());
    }

    getHandRank() {
        return this.handResult.getHandRank();
    }

    getTotalRank() {
        let totalRank = this.getHandRank().rank + this.rankModifier;
        if (totalRank < 1) {
            return 1;
        }
        if (totalRank > 11) {
            return 11;
        }
        return totalRank;
    }

    addHandRankMessage(showHand = true) {
        if (showHand) {
            let cheatin = this.isCheatin() ? 'Cheatin\' ' : '';
            this.game.addMessage('{0}\' hand is: {1}{2} (Rank {3})', this, cheatin, this.getHandRank().rankName, this.getHandRank().rank);
        }
        this.game.addMessage('{0}\'s Total rank: {1} (modifier {2})', this, this.getTotalRank(), this.rankModifier);
    }

    modifyRank(amount) {
        this.rankModifier += amount;
        this.game.raiseEvent('onHandRankModified', { player: this, amount: amount} );
    }

    addCasualties(number) {
        this.casualties += number;
    }

    coverCasualties(number) {
        this.casualties -= number;
        if (this.casualties < 0) {
            this.casualties = 0;
        }
    }

    leftmostDeed() {
        let sorted = _.sortBy(this.locations.filter(location => location.order != null), 'order');
        let leftmost = sorted.shift();
        return leftmost;
    }

    rightmostDeed() {
        let sorted = _.sortBy(this.locations.filter(location => location.order != null), 'order');
        let rightmost = sorted.pop();
        return rightmost;
    }

    addDeedToStreet(card, target) {
        if(card.hasKeyword('Out of Town')) {
            this.locations.push(new Location.GameLocation(card, null, null));
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
        let leftDeed = this.leftmostDeed();
        let newLocation = new Location.GameLocation(card, leftDeed, leftDeed.order - 1);        
        this.locations.push(newLocation);
    }

    addDeedToRight(card) {
        let rightDeed = this.rightmostDeed();
        let newLocation = new Location.GameLocation(card, rightDeed, rightDeed.order + 1);
        this.locations.push(newLocation);
    }   
    
    promptForDeedStreetSide(card) {
        this.game.queueStep(new DeedStreetSidePrompt(this.game, this, card, 'play'));
    }    
    
    inPlayLocation(target) {
        if(UUID.test(target) || target === TownSquareUUID || /street/.test(target)) {
            return true;
        }
    }

    aceCard(card, allowSave = true, options = {}) {
        this.aceCards([card], allowSave, ()=> true, options);
    }

    aceCards(cards, allowSave = true, callback = () => true, options = {}) {
        let action = GameActions.simultaneously(
            cards.map(card => GameActions.aceCard({
                card,
                allowSave,
                options
            }))
        );
        let event = this.game.resolveGameAction(action);
        event.thenExecute(() => {
            let cards = event.childEvents.map(childEvent => childEvent.card);
            callback(cards);
        });

        return event;
    }

    discardCard(card, allowSave = true, options) {
        this.discardCards([card], allowSave, () => true, options);
    }

    discardCards(cards, allowSave = true, callback = () => true, options) {
        let action = GameActions.simultaneously(
            cards.map(card => GameActions.discardCard({
                card,
                allowSave,
                originalLocation: cards[0].location,
                options
            }))
        );
        let event = this.game.resolveGameAction(action);
        event.thenExecute(() => {
            let cards = event.childEvents.map(childEvent => childEvent.card);
            callback(cards);
        });

        return event;
    }

    returnCardToHand(card, allowSave = true) {
        return this.game.resolveGameAction(GameActions.returnCardToHand({ card, allowSave }));
    }

    removeCardFromGame(card, allowSave = true) {
        return this.game.resolveGameAction(RemoveFromGame, { allowSave, card, player: this });
    }

    moveCardToTopOfDeck(card, allowSave = true) {
        this.game.applyGameAction('moveToTopOfDeck', card, card => {
            this.game.raiseEvent('onCardReturnedToDeck', { player: this, card: card, allowSave: allowSave }, event => {
                event.cardStateWhenMoved = card.createSnapshot();
                this.moveCard(card, 'draw deck', { allowSave: allowSave });
            });
        });
    }

    moveCardToBottomOfDeck(card, allowSave = true) {
        this.game.applyGameAction('moveToBottomOfDeck', card, card => {
            this.game.raiseEvent('onCardReturnedToDeck', { player: this, card: card, allowSave: allowSave }, event => {
                event.cardStateWhenMoved = card.createSnapshot();
                this.moveCard(card, 'draw deck', { bottom: true, allowSave: allowSave });
            });
        });
    }

    shuffleCardIntoDeck(card, allowSave = true) {
        this.game.applyGameAction('shuffleIntoDeck', card, card => {
            this.moveCard(card, 'draw deck', { allowSave: allowSave }, () => {
                this.shuffleDrawDeck();
            });
        });
    }

    getTotalControl() {
        let controlCards = this.game.findCardsInPlay(card => card.getControl() > 0 && card.controller === this);
        let control = controlCards.reduce((memo, card) => {
            return memo + card.getControl();
        }, 0);

        return control;
    }   
    
    getTotalInfluence() {
        let influenceCards = this.game.findCardsInPlay(card => card.getInfluence() > 0 && card.controller === this);
        let influence = influenceCards.reduce((memo, card) => {
            return memo + card.getInfluence();
        }, 0);

        return influence;
    }    

    removeAttachment(attachment, allowSave = true) {
        attachment.isBeingRemoved = true;
        attachment.owner.moveCard(attachment, 'discard pile', { allowSave: allowSave }, () => {
            attachment.isBeingRemoved = false;
        });        
    }

    selectDeck(deck) {
        this.deck.selected = false;
        this.deck = deck;
        this.deck.selected = true;
    }

    findLocation(locationUuid) {
        if (locationUuid === TownSquareUUID) {
            return this.game.townsquare;
        }
        return this.locations.find(location => location.uuid === locationUuid);
    }

    getDudesInLocation(locationUuid) {
        return this.cardsInPlay.filter(card => card.getType() === 'dude' && card.gamelocation === locationUuid);
    }

    moveDude(dude, targetLocationUuid, params = {}) {
        let options = {
            isCardEffect: params.isCardEffect != null ? params.isCardEffect : true,
            moveType: params.moveType || 'default',
            needToBoot: params.needToBoot != null ? params.needToBoot : null,
            allowBooted: !!params.allowBooted
        }
        let origin = this.game.findLocation(dude.gamelocation);
        let destination = this.game.findLocation(targetLocationUuid);
        if (origin.uuid === destination.uuid) {
            if (options.needToBoot) {
                this.bootCard(dude);
            }
            return;
        }

        if (options.needToBoot === null && !options.isCardEffect) {
            if (!options.allowBooted && dude.booted) {
                return;
            }
            if (!origin.isAdjacent(destination.uuid)) {
                options.needToBoot = true;
            } else {
                if (origin.isTownSquare()) {
                    if (destination.uuid === this.outfit.uuid) {
                        options.needToBoot = true;
                    }
                } else if (origin.uuid !== this.outfit.uuid) {
                    options.needToBoot = true;
                }
            }
        }

        if (options.needToBoot) {
            this.bootCard(dude);
        }

        dude.moveToLocation(destination.uuid);
    }

    moveCard(card, targetLocation, options = {}, callback) {
        this.removeCardFromPile(card);
        let targetPile = this.getSourceList(targetLocation);

        options = Object.assign({ allowSave: false, bottom: false, isDupe: false }, options);

        if(!targetPile) {
            return;
        }
        if(targetPile.includes(card) && card.location !== 'play area') {
            return;
        }        

        var params = {
            player: this,
            card: card
        };

        if(card.location === 'play area') {

            if(card.owner !== this) {
                card.owner.moveCard(card, targetLocation);
                return;
            }

            if (targetLocation !== 'play area') {

                this.game.raiseEvent('onCardLeftPlay', params, () => {
                    card.attachments.each(attachment => {
                        this.removeAttachment(attachment, false);
                    });

                    card.leavesPlay();

                    if (card.parent) {
                        card.parent.removeAttachment(card);
                    }

                    card.moveTo(targetLocation);

                    if (callback) {
                        callback();
                    }
                });
            }
        }

        if(card.location === 'hand') {
            this.game.raiseEvent('onCardLeftHand', { player: this, card: card });
        }

        if(card.location !== 'play area') {
            card.moveTo(targetLocation);
        }

        if((targetLocation === 'draw deck' || targetLocation === 'discard pile') && !options.bottom) {
            targetPile.unshift(card);
        } else {
            targetPile.push(card);
        }

        if(targetLocation === 'hand') {
            this.game.raiseEvent('onCardEntersHand', { player: this, card: card });
        }

        if(targetLocation === 'draw hand') {
            this.game.raiseEvent('onCardEntersDrawHand', { player: this, card: card });
        }

        if(['dead pile', 'discard pile'].includes(targetLocation)) {
            this.game.raiseEvent('onCardPlaced', { card: card, location: targetLocation, player: this });
        }
        if(callback) {
            callback();
        }
    }

    bootCard(card, playType) {
        return this.game.resolveGameAction(GameActions.bootCard({ card, playType }));
    }

    unbootCard(card, options = {}) {
        return this.game.resolveGameAction(GameActions.unbootCard({ card, force: options.force }));
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
        if(card.controller !== this) {
            card.controller.removeCardFromPile(card);
            card.takeControl(card.owner);
            return;
        }

        var originalLocation = card.location;
        var originalPile = this.getSourceList(originalLocation);

        if(originalPile) {
            originalPile = this.removeCardByUuid(originalPile, card.uuid);
            this.updateSourceList(originalLocation, originalPile.filter(c => c.uuid !== card.uuid));
        }
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
        var summary_list =  list.map(card => {
            var summary = card.getSummary(activePlayer);
            return summary;
        });

        return summary_list;
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

    getStats(isActivePlayer) {
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
        return !this.noTimer && this.user.settings.windowTimer !== 0;
    }

    getState(activePlayer) {
        let isActivePlayer = activePlayer === this;
        let promptState = isActivePlayer ? this.promptState.getState() : {};
        let fullDiscardPile = this.discardPile.concat(this.beingPlayed);

        let state = {
            legend: this.legend,
            cardPiles: {
                cardsInPlay: this.getSummaryForCardList(this.cardsInPlay, activePlayer),
                deadPile: this.getSummaryForCardList(this.deadPile, activePlayer).reverse(),
                discardPile: this.getSummaryForCardList(fullDiscardPile, activePlayer),
                drawDeck: this.getSummaryForCardList(this.drawDeck, activePlayer),
                hand: this.getSummaryForCardList(this.hand, activePlayer),
                drawHand: this.getSummaryForCardList(this.drawHand, activePlayer)
            },
            disconnected: !!this.disconnectedAt,
            outfit: this.outfit.getSummary(activePlayer),
            firstPlayer: this.firstPlayer,
            handRank: this.handResult.rank,
            locations: this.locations,
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
}

module.exports = Player;

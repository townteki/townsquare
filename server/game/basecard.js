const uuid = require('uuid');
const _ = require('underscore');

const AbilityDsl = require('./abilitydsl');
const CardAction = require('./cardaction');
const CardForcedInterrupt = require('./cardforcedinterrupt');
const CardForcedReaction = require('./cardforcedreaction');
const CardInterrupt = require('./cardinterrupt');
const CardMatcher = require('./CardMatcher');
const CardReaction = require('./cardreaction');
const CustomPlayAction = require('./PlayActions/CustomPlayAction');
const EventRegistrar = require('./eventregistrar');
const GameActions = require('./GameActions');
const KeywordsProperty = require('./PropertyTypes/KeywordsProperty');
const ReferenceCountedSetProperty = require('./PropertyTypes/ReferenceCountedSetProperty');
const {Tokens} = require('./Constants');
const JobAction = require('./jobaction');

const LocationsWithEventHandling = ['play area', 'outfit', 'legend'];

class BaseCard {
    constructor(owner, cardData) {
        this.owner = owner;
        this.controllingPlayer = owner;
        this.game = this.owner.game;
        this.cardData = cardData;

        this.uuid = uuid.v1();
        this.code = cardData.code;
        this.name = cardData.name;
        this.title = cardData.title;
        this.gang_code = cardData.gang_code;
        this.facedown = false;
        this.eventsForRegistration = [];
        this.blankCount = 0;
        this.gameLoc = '';
        this.blanks = new ReferenceCountedSetProperty();

        this.cost = cardData.cost;
        this.value = cardData.rank;
        this.suit = cardData.suit;
        this.type = cardData.type;
        this.type_code = cardData.type_code;
        this.production = cardData.production;
        this.influence = cardData.influence;
        this.control = cardData.control;
        this.bullets = cardData.bullets;
        this.wealth = cardData.wealth;
        this.upkeep = cardData.upkeep;

        this.tokens = {};

        this.abilityRestrictions = [];
        this.menu = _([]);
        this.events = new EventRegistrar(this.game, this);

        this.abilities = { actions: [], reactions: [], persistentEffects: [], playActions: [] };
        this.parseKeywords(cardData.keywords || '');
        this.setupCardTextProperties(AbilityDsl);
        this.setupCardAbilities(AbilityDsl);
    }

    get controller() {
        return this.controllingPlayer;
    }

    set controller(controller) {
        this.controllingPlayer = controller;
    }

    parseKeywords(keywords) {
        this.keywords = {};

        var firstLine = keywords.split('\n')[0];

        _.each(firstLine.split('\u2022'), keyword => {
            let results = /(.*)(\d)$/.exec(keyword);    
            
            if(results) {
                let value = results[2];
                keyword = results[1].trim();
                this.addKeywordModifier(keyword, value);
            }
            this.addKeyword(keyword.toLowerCase().trim());
        });
    }

    setupCardTextProperties(ability) {
        this.printedKeywords = this.keywords;

        if(this.printedKeywords.length > 0) {
            this.persistentEffect({
                match: this,
                location: 'any',
                targetLocation: 'any',
                effect: ability.effects.addMultipleKeywords(this.printedKeywords)
            });
        }
    }

    //Unsure if we really need this...
    addKeywordModifier(keyword,value) {
        switch(keyword) {
            case 'Shaman':
                this.shamanSkill = value;
                break;
            default:
                break;
        }
    }

    registerEvents(events) {
        this.eventsForRegistration = events;
    }

    setupCardAbilities() {
    }

    addActionToMenu(action, properties) {
        if(!action.isClickToActivate() && action.allowMenu()) {
            var index = this.abilities.actions.length;
            this.menu.push(action.getMenuItem(index, properties.player));
        }
    }

    action(properties) {
        var action = new CardAction(this.game, this, properties);
        this.addActionToMenu(action, properties);

        this.abilities.actions.push(action);
    }

    job(properties) {
        var job = new JobAction(this.game, this, properties);
        this.addActionToMenu(job, properties);

        this.abilities.actions.push(job);
    }

    //Comprehensive Rules React Priorities
    // 1) Traits with "instead"
    // 2) Reacts with "instead"
    // 3) Other traits
    // 4) Other reacts
    //
    reaction(properties) {
        var reaction = new CardReaction(this.game, this, properties);
        this.abilities.reactions.push(reaction);
    }

    forcedReaction(properties) {
        var reaction = new CardForcedReaction(this.game, this, properties);
        this.abilities.reactions.push(reaction);
    }

    interrupt(properties) {
        var reaction = new CardInterrupt(this.game, this, properties);
        this.abilities.reactions.push(reaction);
    }

    forcedInterrupt(properties) {
        var reaction = new CardForcedInterrupt(this.game, this, properties);
        this.abilities.reactions.push(reaction);
    }

    /**
     * Defines a special play action that can occur when the card is outside the
     * play area (e.g. Lady-in-Waiting's dupe marshal ability)
     */
    playAction(properties) {
        this.abilities.playActions.push(new CustomPlayAction(properties));
    }

    /**
     * Applies an effect that continues as long as the card providing the effect
     * is both in play and not blank.
     */
    persistentEffect(properties) {
        const allowedLocations = ['legend', 'any', 'play area'];
        const defaultLocationForType = {
            legend: 'legend'
        };

        let location = properties.location || defaultLocationForType[this.getType()] || 'play area';

        if(!allowedLocations.includes(location)) {
            throw new Error(`'${location}' is not a supported effect location.`);
        }

        this.abilities.persistentEffects.push(Object.assign({ duration: 'persistent', location: location }, properties));
    }

    resetAbilities() {
        this.abilities.reactions.forEach(reaction => reaction.resetAbilityUsage());
        this.abilities.actions.forEach(action => action.resetAbilityUsage());
    }

    applyAbilityEffect(ability, propertyFactory) {
        if (this.game.shootout) {
            this.untilEndOfShootoutPhase(propertyFactory);
        } else {
            var properties = propertyFactory(AbilityDsl);
            if (ability.playTypePlayed() === 'noon') {
                this.game.addEffect(this, Object.assign({ duration: 'untilEndOfRound', location: 'any' }, properties));
            } else {
                this.game.addEffect(this, Object.assign({ duration: 'untilEndOfPhase', location: 'any', phase: this.game.currentPhase }, properties));
            }
        }
    }

    /**
     * Applies an effect with the specified properties while the current card is
     * attached to another card. By default the effect will target the parent
     * card, but you can provide a match function to narrow down whether the
     * effect is applied (for cases where the effect only applies to specific
     * characters).
     */
    whileAttached(properties) {
        this.persistentEffect({
            condition: () => !!this.parent && (!properties.condition || properties.condition()),
            match: (card, context) => card === this.parent && (!properties.match || properties.match(card, context)),
            targetController: 'any',
            effect: properties.effect,
            recalculateWhen: properties.recalculateWhen
        });
    }

    /**
     * Applies an immediate effect which lasts until the end of the current
     * challenge.
     */
    untilEndOfShootoutPhase(propertyFactory) {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ duration: 'untilEndOfShootoutPhase', location: 'any' }, properties));
    }

    /**
     * Applies an immediate effect which lasts until the end of the phase.
     */
    untilEndOfPhase(propertyFactory, phaseName = '') {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ duration: 'untilEndOfPhase', location: 'any', phase: phaseName }, properties));
    }

    /**
     * Applies an immediate effect which expires at the end of the phase. Per
     * game rules this duration is outside of the phase.
     */
    atEndOfPhase(propertyFactory, phaseName = '') {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ duration: 'atEndOfPhase', location: 'any', phase: phaseName }, properties));
    }

    /**
     * Applies an immediate effect which lasts until the end of the round.
     */
    untilEndOfRound(propertyFactory) {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ duration: 'untilEndOfRound', location: 'any' }, properties));
    }

    /**
     * Applies a lasting effect which lasts until an event contained in the
     * `until` property for the effect has occurred.
     */
    lastingEffect(propertyFactory) {
        let properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ duration: 'custom', location: 'any' }, properties));
    }

    doAction(player, arg) {
        var action = this.abilities.actions[arg];

        if(!action) {
            return;
        }

        action.execute(player, arg);
    }

    hasKeyword(keyword) {
        var keywordCount = this.keywords[keyword.toLowerCase()] || 0;
        return keywordCount > 0;
    }   
    
    hasPrintedKeyword(keyword) {
        return this.printedKeywords.includes(keyword.toLowerCase());
    }    

    createSnapshot() {
        let clone = new BaseCard(this.owner, this.cardData);

        clone.blankCount = this.blankCount;
        clone.controller = this.controller;
        clone.gameLocation = this.gameLocation;
        clone.value = this.value;
        clone.production = this.production;
        clone.influence = this.influence;
        clone.bullets = this.bullets;
        clone.wealth = this.wealth;
        clone.upkeep = this.upkeep;        
        clone.keywords = this.keywords.clone();
        clone.tokens = Object.assign({}, this.tokens);

        return clone;
    }

    resetForRound() {
        this.clearNew();
    }

    getPrintedNumberFor(value) {
        return (value === 'X' ? 0 : value) || 0;
    }

    translateXValue(value) {
        return value === '-' ? 0 : value;
    }

    getPlayActions() {
        return [];
    }
/* TODO M2 what to do with this?

    takeControl(controller, source) {
        if(!controller && controller === this.owner) {
            this.controller = this.owner;
            return;
        }

        this.controller = controller;
    }
*/
    getKeywords() {
        return this.keywords.getValues();
    }

    getPrizedValue() {
        return this.keywords.getPrizedValue();
    }

    hasTrait(trait) {
        if(this.losesAspects.contains('traits')) {
            return false;
        }

        return !this.isFullBlank() && this.traits.contains(trait);
    }

    isFaction(faction) {
        let normalizedFaction = faction.toLowerCase();

        if(this.losesAspects.contains('factions')) {
            return normalizedFaction === 'neutral';
        }

        if(normalizedFaction === 'neutral') {
            return ValidFactions.every(f => !this.factions.contains(f) || this.losesAspects.contains(`factions.${f}`));
        }

        return this.factions.contains(normalizedFaction) && !this.losesAspects.contains(`factions.${normalizedFaction}`);
    }

    isOutOfFaction() {
        return !this.isFaction(this.controller.getFaction()) && !this.isFaction('neutral');
    }

    getFactions() {
        let factions = ValidFactions.filter(faction => this.isFaction(faction));

        if(factions.length === 0) {
            factions.push('neutral');
        }

        return factions;
    }

    getFactionStatus() {
        let gainedFactions = ValidFactions.filter(faction => faction !== this.cardData.faction && this.isFaction(faction));
        let diff = gainedFactions.map(faction => ({ faction: faction, status: 'gained' }));

        if(!this.isFaction(this.cardData.faction) && this.cardData.faction !== 'neutral') {
            return diff.concat({ faction: this.cardData.faction, status: 'lost' });
        }

        return diff;
    }

    applyAnyLocationPersistentEffects() {
        for(let effect of this.abilities.persistentEffects) {
            if(effect.location === 'any') {
                this.game.addEffect(this, effect);
            }
        }
    }

    getPersistentEffects() {
        return this.abilities.persistentEffects.filter(effect => effect.location !== 'any');
    }

    applyPersistentEffects() {
        for(let effect of this.getPersistentEffects()) {
            this.game.addEffect(this, effect);
        }
    }

    entersPlay() {
    }

    leavesPlay() {
        this.tokens = {};        
        this.clearNew();
        this.gamelocation = '';
    }

    clearTokens() {
        this.tokens = {};
    }

    moveTo(targetLocation, parent) {
        let originalLocation = this.location;
        let originalParent = this.parent;

        if(originalParent) {
            originalParent.removeChildCard(this);
        }

        if(originalLocation !== targetLocation) {
            // Clear any tokens on the card unless it is transitioning position
            // within the same area e.g. moving an attachment from one character
            // to another, or a character transferring control between players.
            this.clearTokens();
        }

        this.location = targetLocation;
        this.parent = parent;

        if(LocationsWithEventHandling.includes(targetLocation) && !LocationsWithEventHandling.includes(originalLocation)) {
            this.events.register(this.eventsForRegistration);
        } else if(LocationsWithEventHandling.includes(originalLocation) && !LocationsWithEventHandling.includes(targetLocation)) {
            this.events.unregisterAll();
        }

        for(let action of this.abilities.actions) {
            if(action.isEventListeningLocation(targetLocation) && !action.isEventListeningLocation(originalLocation)) {
                action.registerEvents();
            } else if(action.isEventListeningLocation(originalLocation) && !action.isEventListeningLocation(targetLocation)) {
                action.unregisterEvents();
            }
        }
        for(let reaction of this.abilities.reactions) {
            if(reaction.isEventListeningLocation(targetLocation) && !reaction.isEventListeningLocation(originalLocation)) {
                reaction.registerEvents();
            } else if(reaction.isEventListeningLocation(originalLocation) && !reaction.isEventListeningLocation(targetLocation)) {
                reaction.unregisterEvents();
                this.game.clearAbilityResolution(reaction);
            }
        }

        if(targetLocation !== 'play area') {
            this.facedown = false;
        }

        if(originalLocation !== targetLocation || originalParent !== parent) {
            this.game.raiseEvent('onCardMoved', { card: this, originalLocation: originalLocation, newLocation: targetLocation, parentChanged: originalParent !== parent });
        }
    }

    getMenu(player) {
        if(player.isSpectator()) {
            return;
        }

        let menu = [];
        let actionIndexPairs = this.abilities.actions.map((action, index) => [action, index]);
        let menuActionPairs = actionIndexPairs.filter(pair => {
            let action = pair[0];
            return action.allowPlayer(player) && !action.isClickToActivate() && action.allowMenu();
        });

        if(menuActionPairs.length === 0) {
            return;
        }

        if (this.location === 'play area') {
            menu = [ { command: 'click', text: 'Boot / Unboot' } ];
        }

        return menu.concat(menuActionPairs.map(([action, index]) => action.getMenuItem(index, player)));
    }

    isCopyOf(card) {
        return this.name === card.name;
    }

    isUnique() {
        if(this.hasKeyword('Non-Unique') || this.hasKeyword('Token')) {
            return false;
        } else if(this.getType() === 'dude' || this.getType() === 'deed' || this.hasKeyword('Unique')) {
            return true;
        }
        
        return false;
    }

    isAnyBlank() {
        return this.isFullBlank() || this.isBlankExcludingTraits();
    }

    isFullBlank() {
        return this.blanks.contains('full');
    }

    isBlankExcludingTraits() {
        return this.blanks.contains('excludingTraits');
    }

    isParticipating() {
        return this.game.shootout && this.game.shootout.isInShootout(this);
    }

    isInLeaderPosse() {
        return this.game.shootout && this.game.shootout.isInLeaderPosse(this);
    }

    isInOpposingPosse() {
        return this.game.shootout && this.game.shootout.isInOpposingPosse(this);
    }

    isLeader() {
        return this.game.shootout && this.game.shootout.leader === this;
    }

    isMark() {
        return this.game.shootout && this.game.shootout.mark === this;
    }

    setCardType(cardType) {
        this.cardTypeSet = cardType;
    }

    getType() {
        return this.type_code;
    }

    getPrintedType() {
        return this.cardData.type_code;
    }

    getPrintedFaction() {
        return this.cardData.faction;
    }

    setBlank(type) {
        let before = this.isAnyBlank();
        this.blanks.add(type);
        let after = this.isAnyBlank();

        if(!before && after) {
            this.game.raiseEvent('onCardBlankToggled', { card: this, isBlank: after });
        }
    }

    allowGameAction(actionType, context) {
        let currentAbilityContext = context || this.game.currentAbilityContext;
        return !this.abilityRestrictions.some(restriction => restriction.isMatch(actionType, currentAbilityContext));
    }

    addAbilityRestriction(restriction) {
        this.abilityRestrictions.push(restriction);
        this.markAsDirty();
    }

    removeAbilityRestriction(restriction) {
        this.abilityRestrictions = this.abilityRestrictions.filter(r => r !== restriction);
        this.markAsDirty();
    }

    addKeyword(keyword) {
        var lowerCaseKeyword = keyword.toLowerCase();

        if(!lowerCaseKeyword || lowerCaseKeyword === '') {
            return;
        }

        if(!this.keywords[lowerCaseKeyword]) {
            this.keywords[lowerCaseKeyword] = 1;
        } else {
            this.keywords[lowerCaseKeyword]++;
        }
    }

    addFaction(faction) {
        if(!faction) {
            return;
        }

        let lowerCaseFaction = faction.toLowerCase();
        this.factions.add(lowerCaseFaction);

        this.markAsDirty();
    }

    removeKeyword(keyword) {
        var lowerCaseKeyword = keyword.toLowerCase();
        this.keywords[lowerCaseKeyword] = this.keywords[lowerCaseKeyword] || 0;
        this.keywords[lowerCaseKeyword]--;
    }

    removeFaction(faction) {
        this.factions.remove(faction.toLowerCase());
        this.markAsDirty();
    }

    clearNew() {
        this.new = false;
    }

    clearBlank(type) {
        let before = this.isAnyBlank();
        this.blanks.remove(type);
        let after = this.isAnyBlank();

        if(before && !after) {
            this.game.raiseEvent('onCardBlankToggled', { card: this, isBlank: after });
        }
    }

    hasText(text) {
        let cardText = this.cardData.text.toLowerCase();
        return cardText.includes(text.toLowerCase());
    }

    get gamelocation() {
        if (this.location !== 'play area') {
            return '';
        }
        if (this.getType() === 'dude') {
            return this.gameLoc;
        }
        if (this.getType() === 'deed') {
            return this.uuid;
        }
        if (this.getType() === 'goods' || this.getType() === 'spell') {
            return this.parent ? this.parent.gamelocation : '';
        }

        return '';
    }

    set gamelocation(gamelocation) {
        this.gameLoc = gamelocation;
    }

    get ghostrock() {
        return this.tokens[Tokens.ghostrock] || 0;
    }

    modifyGhostRock(amount) {
        this.modifyToken(Tokens.ghostrock, amount);
    }

    addToken(type, number) {
        if(_.isUndefined(this.tokens[type])) {
            this.tokens[type] = 0;
        }

        this.tokens[type] += number;
    }

    hasToken(type) {
        return !!this.tokens[type];
    }

    removeToken(type, number) {
        this.tokens[type] -= number;

        if(this.tokens[type] < 0) {
            this.tokens[type] = 0;
        }

        if(this.tokens[type] === 0) {
            delete this.tokens[type];
        }
    } 

    modifyToken(type, number) {
        if(!this.tokens[type]) {
            this.tokens[type] = 0;
        }

        this.tokens[type] += number;

        if(this.tokens[type] < 0) {
            this.tokens[type] = 0;
        }

        if(this.tokens[type] === 0) {
            delete this.tokens[type];
        }

        this.markAsDirty();
    }

    isMatch(properties) {
        return CardMatcher.isMatch(this, properties);
    }

    markAsDirty() {
        this.isDirty = true;
    }

    clearDirty() {
        this.isDirty = false;
    }

    getLocation() {
        if (!this.gamelocation) {
            return;
        }
        return this.game.findLocation(this.gamelocation);
    }

    isInTownSquare() {
        let location = this.getLocation();
        return location && location.isTownSquare();
    }

    getLocationCard() {
        let location = this.getLocation();
        if (!location) {
            return;
        }
        return location.getLocationCard(this.game);
    }

    updateGameLocation(target) {
        if(this.getType() === 'dude') {
            this.gamelocation = target;
        } else if(this.getType() === 'deed') {
            this.gamelocation = this.uuid;
        }
    }    

    // This will be overriden by card subclasses that modify adjacency.
    // TODO M2 check if this can be done with persistent effects
    modifiedAdjacentLocations() {
        return {
            additionalAdjacency: null,
            removedAdjacency: null
        }
    }

    onClick(player) {
        var action = this.abilities.actions.find(action => action.isClickToActivate());
        if(action) {
            return action.execute(player) || action.deactivate(player);
        }

        return false;
    }

    getGameElementType() {
        return 'card';
    }

    isAttachment() {
        if(_.intersection(['spell', 'goods'],[this.getType()]).length > 0) {
            return true;
        }
    }

    coversCasualties(type = 'any') {
        if (this.getType() === 'dude') {
            let harrowCasualty = this.isHarrowed() ? 1 : 0;
            if (type === 'ace' || type === 'any') {
                return 2 + harrowCasualty;
            }
            if (type === 'discard') {
                return 1 + harrowCasualty;
            }
            return harrowCasualty;
        }
        if ((this.getType() === 'goods' || this.getType() === 'spell') && this.hasKeyword('sidekick')) {
            if (type === 'ace') {
                return 0;
            }
            return 1;
        }
        return 0;
    }

    getShortSummary() {
        return {
            code: this.cardData.code,
            title: this.cardData.title,
            type: this.getType()
        };
    }

    getSummary(activePlayer) {
        let selectionState = activePlayer.getCardSelectionState(this);
        if(!this.game.isCardVisible(this, activePlayer)) {
            return { facedown: true, uuid: this.uuid, tokens: this.tokens, ...selectionState };
        }     

        let state = {
            printedStats: {
                bullets: this.cardData.bullets,
                shooter: this.cardData.shooter,
                influence: this.cardData.influence,
                control: this.cardData.control,
                value: this.cardData.value,
                suit: this.cardData.suit,
                upkeep: this.cardData.upkeep,
                production: this.cardData.production
            },
            bullets: this.bullets,
            code: this.cardData.code,
            cost: this.cardData.cost,
            controlled: this.owner !== this.controller,
            facedown: this.facedown,
            gamelocation: this.gamelocation,
            influence: this.influence,
            keywords: this.keywords,
            location: this.location,
            menu: this.getMenu(activePlayer),
            new: this.new,
            production: this.production,
            suit: this.suit,
            title: this.title,
            tokens: this.tokens,
            type_code: this.cardData.type_code,
            upkeep: this.upkeep,
            uuid: this.uuid,
            value: this.value,
            wealth: this.wealth
        };

        return Object.assign(state, selectionState);
    }
}

module.exports = BaseCard;

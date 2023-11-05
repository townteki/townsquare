const uuid = require('uuid');
const _ = require('underscore');

const AbilityDsl = require('./abilitydsl');
const CardAction = require('./cardaction');
const CardTraitReaction = require('./cardtraitreaction');
const CardBeforeReaction = require('./cardbeforereaction');
const CardMatcher = require('./CardMatcher');
const CardReaction = require('./cardreaction');
const CustomPlayAction = require('./PlayActions/CustomPlayAction');
const EventRegistrar = require('./eventregistrar');
const KeywordsProperty = require('./PropertyTypes/KeywordsProperty');
const ReferenceCountedSetProperty = require('./PropertyTypes/ReferenceCountedSetProperty');
const {Tokens} = require('./Constants');
const JobAction = require('./jobaction');
const NullCard = require('./nullcard');
const SpellAction = require('./spellaction');
const SpellReaction = require('./spellreaction');
const SpellBeforeReaction = require('./spellbeforereaction');
const CardTraitBeforeReaction = require('./cardtraitbeforereaction');
const TechniqueAction = require('./techniqueaction');
const SpellJobAction = require('./spelljobaction');

/** @typedef {import('./AbilityContext')} AbilityContext */
/** @typedef {import('./AbilityDsl')} AbilityDsl */
/** @typedef {import('./game')} Game */
/** @typedef {import('./player')} Player */

class BaseCard extends NullCard {
    constructor(owner, cardData) {
        super();
        /** @type {Player} */
        this.owner = owner;
        /** @type {Player} */
        this.controllingPlayer = owner;
        /** @type {Game} */
        this.game = this.owner.game;
        this.cardData = cardData;

        this.uuid = uuid.v1();
        this.code = cardData.code;
        this.title = cardData.title;
        this.gang_code = cardData.gang_code;
        if(!Array.isArray(this.gang_code)) {
            this.gang_code = [this.gang_code];
        }        
        this.facedown = false;
        this.eventsForRegistration = [];
        this.blankCount = 0;
        this.gameLoc = '';
        this.blanks = new ReferenceCountedSetProperty();

        this.cost = cardData.cost;
        this.currentValue = cardData.rank;
        this.suitReferenceArray = [];
        this.suitReferenceArray.unshift({ source: 'default', suit: this.cardData.suit});
        this.type = cardData.type;
        this.type_code = cardData.type_code;
        this.currentBullets = cardData.bullets;
        this.currentInfluence = cardData.influence;
        this.currentProduction = cardData.production;
        this.wealth = cardData.wealth;
        this.permanentBullets = 0;
        this.permanentInfluence = 0;
        this.permanentProduction = 0;
        this.permanentValue = 0;
        this.startingSize = 1;
        this.startingCondition = () => true;
        this.maxBullets = null;
        this.minBullets = 0;        

        this.tokens = {};

        this.abilityRestrictions = [];
        this.events = new EventRegistrar(this.game, this);

        this.abilities = { actions: [], reactions: [], persistentEffects: [], playActions: [] };
        this.keywords = new KeywordsProperty(this.cardData.keywords || '');
        this.setupCardAbilities(AbilityDsl);
    }

    get controller() {
        return this.controllingPlayer;
    }

    set controller(controller) {
        this.controllingPlayer = controller;
    }

    get value() {
        if(this.currentValue <= 0) {
            return 1;
        }
        if(this.currentValue > 13) {
            return 13;
        }
        return this.currentValue;
    }

    set value(amount) {
        this.currentValue = amount;
    }

    get suit() {
        return this.suitReferenceArray[0].suit || '';
    }

    get bullets() {
        if(this.currentBullets < this.minBullets) {
            return this.minBullets;
        }
        return this.currentBullets;
    }

    set bullets(amount) {
        this.currentBullets = amount;
    }

    get influence() {
        if(this.currentInfluence < 0) {
            return 0;
        }
        return this.currentInfluence;
    }

    set influence(amount) {
        this.currentInfluence = amount;
    }

    get production() {
        if(this.currentProduction < 0) {
            return 0;
        }
        return this.currentProduction;
    }

    set production(amount) {
        this.currentProduction = amount;
    }

    get locationCard() {
        let location = this.getGameLocation();
        if(!location) {
            return new NullCard();
        }
        return location.locationCard;
    }

    getSundownInfluence() {
        const clonedGame = this.game.simulateSundown();
        const clonedCard = clonedGame.findCardInPlayByUuid(this.uuid);
        return clonedCard.influence;
    }
    
    equals(card) {
        return card && this.uuid === card.uuid;
    }

    getValueText() {
        switch(this.value) {
            case 1:
                return 'A';
            case 11:
                return 'J';
            case 12:
                return 'Q';
            case 13:
                return 'K';  
            default:
                return this.value;
        }
    }

    addSuitEffect(source, suit = '') {
        let newSuit = suit.toLowerCase();
        if(!newSuit) {
            return;
        }
        newSuit = newSuit[0].toUpperCase() + newSuit.slice(1);
        this.suitReferenceArray.unshift({ source, suit: newSuit });
    }

    removeSuitEffect(source) {
        this.suitReferenceArray = this.suitReferenceArray.filter(suitRef => suitRef.source !== source);
    }

    registerEvents(events) {
        this.eventsForRegistration = events;
    }

    setupCardAbilities() {
    }

    /**
     * Define regular card action (`Noon:`, `Shootout:` but not jobs or spells)
     *
     * @param {import('./cardaction').ActionAbilityProperties} properties
     */    
    action(properties) {
        properties.printed = properties.printed || properties.printed === false ? properties.printed : true;
        var action = new CardAction(this.game, this, properties);
        this.abilities.actions.push(action);
    }

    /**
     * Define job card action (`Noon Job:`)
     *
     * @param {import('./jobaction').JobAbilityProperties} properties
     */ 
    job(properties) {
        properties.printed = properties.printed || properties.printed === false ? properties.printed : true;
        var job = new JobAction(this.game, this, properties);
        this.abilities.actions.push(job);
    }

    /**
     * Define Spell card action (e.g. `Noon Spirit:`, `Shootout Miracle:`)
     *
     * @param {import('./spellaction').SpellActionAbilityProperties} properties
     */ 
    spellAction(properties) {
        properties.printed = properties.printed || properties.printed === false ? properties.printed : true;
        properties.triggeringPlayer = properties.triggeringPlayer || (this.hasKeyword('totem') ? 'any' : undefined);
        var spell = new SpellAction(this.game, this, properties);
        this.abilities.actions.push(spell);
    }

    /**
     * Define Spell card action that starts a job (e.g. `Noon Job Miracle:`)
     * Some cards start a job but do not have it marked before the colon (e.g. For Such a Time as This, Summoning)
     *
     * @param {import('./spelljobaction').SpellJobActionAbilityProperties} properties
     */ 
    spellJobAction(properties) {
        properties.printed = properties.printed || properties.printed === false ? properties.printed : true;
        properties.triggeringPlayer = properties.triggeringPlayer || (this.hasKeyword('totem') ? 'any' : undefined);
        var spell = new SpellJobAction(this.game, this, properties);
        this.abilities.actions.push(spell);
    }

    /**
     * Define Technique card action (e.g. `Noon Technique:`, `Shootout Tao Technique:`)
     *
     * @param {import('./techniqueaction').TechniqueAbilityProperties} properties
     */ 
    techniqueAction(properties) {
        properties.printed = properties.printed || properties.printed === false ? properties.printed : true;
        var technique = new TechniqueAction(this.game, this, properties);
        this.abilities.actions.push(technique);
    }

    /**
     * Define regular card reaction (`React:` but not spell reactions)
     *
     * @param {import('./cardreaction').ReactionAbilityProperties} properties
     */
    reaction(properties) {
        properties.printed = properties.printed || properties.printed === false ? properties.printed : true;
        var reaction;
        if(properties.triggerBefore) {
            reaction = new CardBeforeReaction(this.game, this, properties);            
        } else {
            reaction = new CardReaction(this.game, this, properties);
        }
        this.abilities.reactions.push(reaction);
    }

    /**
     * Define Spell card reaction (e.g. `React Hex:`, `React Miracle:`)
     *
     * @param {import('./spellreaction').SpellReactionAbilityProperties} properties
     */ 
    spellReaction(properties) {
        properties.printed = properties.printed || properties.printed === false ? properties.printed : true;
        var reaction;
        if(properties.triggerBefore) {
            reaction = new SpellBeforeReaction(this.game, this, properties);            
        } else {
            reaction = new SpellReaction(this.game, this, properties);
        }
        this.abilities.reactions.push(reaction);
    }

    /**
     * Define card Trait reaction (Trait text on card that reacts on some event)
     *
     * @param {import('./traittriggeredability').TraitAbilityProperties} properties
     */ 
    traitReaction(properties) {
        var reaction;
        if(properties.triggerBefore) {
            reaction = new CardTraitBeforeReaction(this.game, this, properties);            
        } else {
            reaction = new CardTraitReaction(this.game, this, properties);
        }
        this.abilities.reactions.push(reaction);
    }

    /**
     * Defines a special play action that can occur when the card is outside the
     * play area.
     */
    playAction(properties) {
        this.abilities.playActions.push(new CustomPlayAction(this.game, this, properties));
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

        this.abilities.persistentEffects.push(Object.assign({ 
            duration: 'persistent', 
            location: location,
            fromTrait: true
        }, properties));
    }

    resetAbilities() {
        this.abilities.reactions.forEach(reaction => reaction.resetAbilityUsage());
        this.abilities.actions.forEach(action => action.resetAbilityUsage());
    }

    updateAbilitiesBlanking(condition = () => true, cannotBeUsed = true) {
        this.abilities.actions.concat(this.abilities.reactions).forEach(ability => {
            if(condition(ability)) {
                ability.cannotBeUsed = cannotBeUsed;
            }
        });
    }

    hasReactionFor(event, abilityType) {
        return this.abilities.reactions.some(reaction => 
            reaction.eventType === abilityType &&
            reaction.when[event.name] && reaction.when[event.name](event));
    }

    /**
     * Applies effect (described in `propertyFactory`) of the ability and sets duration
     * based on the default rules:
     *  - Shootout ability until end of shootout
     *  - Noon ability until end of the round (Sundown)
     *  - Reacts based on the phase they were triggered
     * 
     * @param {AbilityDsl} ability
     * @param {(ability: AbilityDsl) => void} propertyFactory
     */    
    applyAbilityEffect(ability, propertyFactory, causedByPlayType) {
        if(this.game.shootout) {
            this.untilEndOfShootoutPhase(ability, propertyFactory, causedByPlayType);
        } else {
            var properties = propertyFactory(AbilityDsl);
            if(ability.playTypePlayed() === 'noon') {
                this.game.addEffect(this, Object.assign({ 
                    duration: 'untilEndOfRound', 
                    location: 'any', 
                    ability: ability,
                    causedByPlayType: ability.playTypePlayed()
                }, properties));
            } else {
                this.game.addEffect(this, Object.assign({ 
                    duration: 'untilEndOfPhase', 
                    location: 'any', 
                    phase: this.game.currentPhase, 
                    ability: ability,
                    causedByPlayType: ability.playTypePlayed()
                }, properties));
            }
        }
    }

    /**
     * Applies an immediate effect which lasts until the end of the current
     * shootout round.
     */
    untilEndOfShootoutRound(ability, propertyFactory, targetLocation = 'play area', causedByPlayType) {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ 
            duration: 'untilEndOfShootoutRound', 
            location: 'any', 
            targetLocation: targetLocation,
            ability: ability,
            causedByPlayType: this.buildPlayTypePlayed(ability, causedByPlayType)  
        }, properties));
    }

    /**
     * Applies an immediate effect which lasts until the end of the current
     * shootout phase.
     */
    untilEndOfShootoutPhase(ability, propertyFactory, causedByPlayType) {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ 
            duration: 'untilEndOfShootoutPhase', 
            location: 'any', 
            ability: ability,
            causedByPlayType: this.buildPlayTypePlayed(ability, causedByPlayType)  
        }, properties));
    }

    /**
     * Applies an immediate effect which lasts until the end of the phase.
     */
    untilEndOfPhase(ability, propertyFactory, phaseName = '', causedByPlayType) {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ 
            duration: 'untilEndOfPhase', 
            location: 'any', 
            phase: phaseName, 
            ability: ability,
            causedByPlayType: this.buildPlayTypePlayed(ability, causedByPlayType)   
        }, properties));
    }

    /**
     * Applies an immediate effect which expires at the end of the phase. Per
     * game rules this duration is outside of the phase.
     */
    atEndOfPhase(ability, propertyFactory, phaseName = '', causedByPlayType) {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ 
            duration: 'atEndOfPhase', 
            location: 'any', 
            phase: phaseName, 
            ability: ability,
            causedByPlayType: this.buildPlayTypePlayed(ability, causedByPlayType)   
        }, properties));
    }

    /**
     * Applies an immediate effect which lasts until the end of the round.
     */
    untilEndOfRound(ability, propertyFactory, causedByPlayType) {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ 
            duration: 'untilEndOfRound', 
            location: 'any', 
            ability: ability,
            causedByPlayType: this.buildPlayTypePlayed(ability, causedByPlayType)   
        }, properties));
    }

    /**
     * Applies a lasting effect which lasts until an event contained in the
     * `until` property for the effect has occurred.
     */
    lastingEffect(ability, propertyFactory, causedByPlayType, targetLocation = 'play area') {
        let properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ 
            duration: 'custom', 
            location: 'any', 
            ability: ability,
            targetLocation: targetLocation,
            causedByPlayType: this.buildPlayTypePlayed(ability, causedByPlayType)   
        }, properties));
    }

    buildPlayTypePlayed(ability, causedByPlayType) {
        if(causedByPlayType) {
            return causedByPlayType;
        }
        return ability ? ability.playTypePlayed() : undefined;
    }

    doAction(player, arg) {
        var action = this.abilities.actions[arg];

        if(!action) {
            return true;
        }

        action.execute(player);
        return true;
    }

    findKeywords(condition) {
        return this.keywords.getValues().filter(keyword => condition(keyword.toLowerCase()));
    }

    hasKeyword(keyword) {
        return this.keywords.contains(keyword.toLowerCase());
    }

    hasOneOfKeywords(keywords) {
        if(!Array.isArray(keywords)) {
            return this.hasKeyword(keywords);
        }
        return keywords.some(keyword => this.hasKeyword(keyword.toLowerCase()));
    }

    hasAllOfKeywords(keywords) {
        if(!Array.isArray(keywords)) {
            return this.hasKeyword(keywords);
        }
        return keywords.every(keyword => this.hasKeyword(keyword.toLowerCase()));
    }
    
    hasPrintedKeyword(keyword) {
        return this.keywords.hasPrintedKeyword(keyword.toLowerCase());
    }    

    createSnapshot(clone, cloneBaseAttributes = true) {
        if(!clone) {
            clone = new BaseCard(this.owner, this.cardData);
        }

        if(cloneBaseAttributes) {
            clone = this.cloneBaseAttributes(clone);
        }
        clone.location = this.location;
        clone.blankCount = this.blankCount;
        clone.controllingPlayer = this.controllingPlayer;
        clone.gameLoc = this.gameLoc;
        clone.blanks = this.blanks;
        
        clone.tokens = Object.assign({}, this.tokens);
        clone.abilityRestrictions = this.abilityRestrictions;
        clone.events = this.events;
        clone.eventsForRegistration = this.eventsForRegistration;

        return clone;
    }

    cloneBaseAttributes(clone) {
        if(!clone) {
            return;
        }
        clone.suitReferenceArray = this.suitReferenceArray;
        clone.currentValue = this.currentValue;
        clone.currentProduction = this.currentProduction;
        clone.currentInfluence = this.currentInfluence;
        clone.currentBullets = this.currentBullets;
        clone.wealth = this.wealth;
        clone.keywords = this.keywords.clone();

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

    hasTrait(trait) {
        if(this.losesAspects.contains('traits')) {
            return false;
        }

        return !this.isFullBlank() && this.traits.contains(trait);
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
        this.resetAbilities();
        this.tokens = {};        
        this.clearNew();
        this.gamelocation = '';
        this.controller = this.owner;
        this.resetStats();
    }

    clearTokens() {
        this.tokens = {};
    }

    getMenu(player) {
        if(player.isSpectator()) {
            return;
        }

        let menu = [];
        let menuActionItems = this.getActionMenuItems(player);

        if(this.location === 'play area' && player.equals(this.controller)) {
            menu = [{ method: 'toggleUnBoot', text: 'Boot / Unboot' }];
        }
        if(!menu.length && menuActionItems.filter(menuItem => 
            menuItem.action.allowPlayer(player) && !menuItem.action.isClickToActivate() && menuItem.action.allowMenu()).length === 0) {
            return;
        }
        let menuCardActionItems = menuActionItems.filter(menuItem => menuItem.action.abilitySourceType === 'card');
        if(menuCardActionItems.length > 0) {
            let menuIcon = 'cog';
            const disabled = menuCardActionItems.every(menuItem => menuItem.item.disabled);
            if(disabled) {
                if(menuCardActionItems.length === 1) {
                    menuIcon = menuCardActionItems[0].item.menuIcon;
                } else {
                    menuIcon = null;
                }
            }
            menu = menu.concat({ 
                text: 'Use ability', 
                method: 'useAbility', 
                triggeringPlayer: 'any',
                disabled: disabled,
                menuIcon: menuIcon
            });
        }
        let menuOtherActionItems = menuActionItems.filter(menuItem => menuItem.action.abilitySourceType !== 'card');
        if(menuOtherActionItems.length > 0) {
            menu = menu.concat(menuOtherActionItems.map(menuItem => menuItem.item));
        }
        return menu;
    }

    hasEnabledCardAbility(player, options = {}, action) {
        const cardAbilityMenuItems = this.getActionMenuItems(player, options)
            .filter(menuItem => (!action || action === menuItem.action) && menuItem.action.abilitySourceType === 'card');
        return cardAbilityMenuItems && cardAbilityMenuItems.some(menuItem => !menuItem.item.disabled);
    }

    getActionMenuItems(player, options) {
        return this.abilities.actions.map((action, index) => { 
            if(options) {
                action.options = Object.assign(action.options || {}, options);
            }
            return { 
                action: action, 
                item: action.getMenuItem(index, player)
            }; 
        });
    }

    toggleUnBoot(player) {
        if(this.facedown || !this.controller.equals(player)) {
            return;
        }

        this.booted = !this.booted;
        let bootStatus = this.booted ? 'boots' : 'unboots';

        this.game.addAlert('danger', '{0} {1} {2}', player, bootStatus, this);  
    }

    useAbility(player, options = {}) {
        let menuActionItems = this.getActionMenuItems(player, options).filter(menuItem => menuItem.action.abilitySourceType === 'card');
        if(menuActionItems.length === 0) {
            return;
        }
        if(menuActionItems.length === 1) {
            if(!menuActionItems[0].item.disabled) {
                this.doAction(player, menuActionItems[0].item.arg);
            }
            return;
        }
        let buttons = menuActionItems.map(menuItem => menuItem.item).concat([{ text: 'Cancel', method: 'cancelAbilityMenu' }]);
        this.game.promptWithMenu(player, this, {
            activePrompt: {
                menuTitle: 'Choose ability to execute',
                buttons: buttons
            },
            source: this
        });
    }

    cancelAbilityMenu() {
        return true;
    }

    isToken() {
        return this.hasKeyword('Token');
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
        return this.isFullBlank() || this.isBlankExcludingKeywords();
    }

    isFullBlank() {
        return this.blanks.contains('full');
    }

    isBlankExcludingKeywords() {
        return this.blanks.contains('excludingKeywords');
    }

    isTraitBlank() {
        return this.blanks.contains('trait');
    }

    isParticipating() {
        return this.game.shootout && this.game.shootout.isInShootout(this);
    }

    isOpposing(player) {
        return this.isParticipating() && !this.controller.equals(player);
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

    getPrintedStat(stat) {
        switch(stat) {
            case 'suit': return this.cardData.suit;
            case 'value': return this.cardData.rank;
            case 'bullets': return this.cardData.bullets;
            case 'influence': return this.cardData.influence;
            case 'control': return this.cardData.control;
            case 'upkeep': return this.cardData.upkeep;
            case 'production': return this.cardData.production;
            case 'cost': return this.cardData.cost;
        }
    }

    resetStats() {
        this.suitReferenceArray = [];
        this.suitReferenceArray.unshift({ source: 'default', suit: this.cardData.suit});
        this.value = this.currentValue - this.permanentValue;
        this.permanentValue = 0;
        this.bullets = this.currentBullets - this.permanentBullets;
        this.permanentBullets = 0;
        this.influence = this.currentInfluence - this.permanentInfluence;
        this.permanentInfluence = 0;
        this.production = this.currentProduction - this.permanentProduction;
        this.permanentProduction = 0;        
    }

    setBlank(type) {
        let before = this.isAnyBlank();
        let beforeTrait = this.isTraitBlank();
        this.blanks.add(type);
        let after = this.isAnyBlank();
        let afterTrait = this.isTraitBlank();

        if((!before && after) || (!beforeTrait && afterTrait)) {
            this.game.raiseEvent('onCardBlankToggled', { card: this, isBlank: after || afterTrait, blankType: type });
        }
    }

    allowGameAction(actionType, context, options = {}) {
        let currentAbilityContext = context;
        if(!currentAbilityContext) {
            if(options.isCardEffect !== false) {
                currentAbilityContext = this.game.currentAbilityContext;
            } else {
                currentAbilityContext = { game: this.game, player: this.controller };
            }
        }
        if(currentAbilityContext && !currentAbilityContext.card) {
            currentAbilityContext.card = this;
        }
        let callback = restriction => restriction.isMatch(actionType, currentAbilityContext, this.controller);
        if(this.game.shootout && this.game.shootout.abilityRestrictions.some(callback)) {
            return false;
        }
        return !this.abilityRestrictions.some(callback);
    }

    addAbilityRestriction(restriction) {
        this.abilityRestrictions.push(restriction);
        this.markAsDirty();
    }

    removeAbilityRestriction(restriction) {
        this.abilityRestrictions = this.abilityRestrictions.filter(r => r !== restriction);
        this.markAsDirty();
    }

    removeEffects(condition = () => true) {
        this.game.effectEngine.effects.forEach(effect => {
            if(condition(effect)) {
                effect.removeTarget(this);
            }
        });  
    }

    addKeyword(keyword) {
        this.keywords.addKeyword(keyword);
    }

    removeKeyword(keyword) {
        this.keywords.removeKeyword(keyword);
    }

    clearNew() {
        this.new = false;
    }

    clearBlank(type) {
        let before = this.isAnyBlank();
        let beforeTrait = this.isTraitBlank();
        this.blanks.remove(type);
        let after = this.isAnyBlank();
        let afterTrait = this.isTraitBlank();

        if((before && !after) || (beforeTrait && !afterTrait)) {
            this.game.raiseEvent('onCardBlankToggled', { card: this, isBlank: after || afterTrait, blankType: type });
        }
    }

    hasText(text) {
        let cardText = this.cardData.text.toLowerCase();
        return cardText.includes(text.toLowerCase());
    }

    isScripted() {
        return this.cardData.scripted;
    }

    get gamelocation() {
        if(this.location !== 'play area') {
            return '';
        }
        if(this.getType() === 'dude') {
            return this.gameLoc;
        }
        if(this.getType() === 'deed' || this.getType() === 'outfit') {
            return this.uuid;
        }

        return '';
    }

    set gamelocation(gamelocation) {
        this.gameLoc = gamelocation;
    }

    get ghostrock() {
        return this.tokens[Tokens.ghostrock] || 0;
    }

    set ghostrock(amount) {
        this.tokens[Tokens.ghostrock] = amount;
        if(this.tokens[Tokens.ghostrock] === 0) {
            delete this.tokens[Tokens.ghostrock];
        }
    }

    modifyGhostRock(amount) {
        this.modifyToken(Tokens.ghostrock, amount);
    }

    modifyValue(amount, applying = true, fromEffect = false) {
        this.currentValue += amount;
        if(!fromEffect) {
            this.permanentValue += amount;
        }

        let params = {
            card: this,
            amount: amount,
            applying: applying
        };
        this.game.raiseEvent('onCardValueChanged', params);
    }

    modifyBullets(amount, applying = true, fromEffect = false) {
        this.currentBullets += amount;
        if(!fromEffect) {
            this.permanentBullets += amount;
        }

        let params = {
            card: this,
            amount: amount,
            applying: applying,
            fromEffect
        };
        this.game.raiseEvent('onCardBulletsChanged', params);
    }

    modifyInfluence(amount, applying = true, fromEffect = false) {
        this.currentInfluence += amount;
        if(!fromEffect) {
            this.permanentInfluence += amount;
        }

        let params = {
            card: this,
            amount: amount,
            applying: applying
        };
        this.game.raiseEvent('onCardInfluenceChanged', params);
    }

    modifyProduction(amount, applying = true, fromEffect = false) {
        this.currentProduction += amount;
        if(!fromEffect) {
            this.permanentProduction += amount;
        }

        let params = {
            card: this,
            amount: amount,
            applying: applying
        };
        this.game.raiseEvent('onCardProductionChanged', params);
    }

    modifySkillRating(skillName, amount, applying = true) {
        this.keywords.modifySkillRating(skillName, amount); 

        let params = {
            card: this,
            amount: amount,
            type: skillName,
            applying: applying
        };
        this.game.raiseEvent('onCardSkillRatingChanged', params);
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

    getGameLocation() {
        if(!this.gamelocation) {
            return;
        }
        return this.game.findLocation(this.gamelocation);
    }

    isAdjacent(locationUuid) {
        if(this.location !== 'play area') {
            return false;
        }
        let gameLocationObject = this.getGameLocation();
        return gameLocationObject && gameLocationObject.isAdjacent(locationUuid);
    }

    isNearby(locationUuid) {
        return this.gamelocation === locationUuid || this.isAdjacent(locationUuid);
    }

    isInControlledLocation() {
        return this.locationCard.controller.equals(this.controller);
    }

    isInSameLocation(card) {
        const thisLocation = this.getGameLocation();
        const cardLocation = card.getGameLocation();
        return thisLocation && cardLocation && thisLocation.uuid === cardLocation.uuid;
    }

    isInTownSquare() {
        const location = this.getGameLocation();
        return location && location.isTownSquare();
    }

    isInOpponentsHome() {
        const location = this.getGameLocation();
        return location && location.isOpponentsHome(this.controller);
    }
    
    isInOutOfTown() {
        const location = this.getGameLocation();
        const tempLocCard = location ? location.locationCard : null;
        return tempLocCard && tempLocCard.isOutOfTown();
    }
    
    isInShootoutLocation() {
        if(!this.game.shootout) {
            return false;
        }
        const location = this.game.shootout.shootoutLocation;
        return location && location.uuid === this.gamelocation;
    }    

    isLocationCard() {
        return false;
    }

    updateGameLocation(target) {
        if(this.getType() === 'dude') {
            this.gamelocation = target;
        } else if(this.getType() === 'deed') {
            this.gamelocation = this.uuid;
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
        if(_.intersection(['spell', 'goods'], [this.getType()]).length > 0) {
            return true;
        }
    }

    isSpell() {
        return false;
    }

    coversCasualties(type = 'any', context) {
        if((context && !this.allowGameAction(type, context, { isCardEffect: false })) ||
            this.cannotBeChosenAsCasualty()) {
            return 0;
        }
        if(this.getType() === 'dude') {
            let harrowCasualty = this.isHarrowed() ? 1 : 0;
            if(type === 'ace' || type === 'any') {
                return 2 + harrowCasualty;
            }
            if(type === 'discard') {
                return 1 + harrowCasualty;
            }
            return harrowCasualty;
        }
        if((this.getType() === 'goods' || this.getType() === 'spell') && this.hasKeyword('sidekick')) {
            if(type === 'ace') {
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
            const facedownSummary = {
                facedown: true, 
                uuid: this.uuid, 
                tokens: this.tokens,
                ...selectionState                 
            };
            if(this.location === 'play area') {
                return Object.assign(facedownSummary, {
                    gamelocation: this.gamelocation,
                    type_code: this.cardData.type_code                
                });
            }
            return facedownSummary;
        }
        const effects = this.game.effectEngine.getAppliedEffectsOnTarget(this)
            .filter(effect => effect.effect.title).map(effect => effect.getSummary());

        let state = {
            printedStats: {
                bullets: this.cardData.bullets,
                shooter: this.cardData.shooter,
                influence: this.cardData.influence,
                control: this.cardData.control,
                value: this.cardData.rank,
                suit: this.cardData.suit,
                keywords: this.keywords.printedData,
                upkeep: this.cardData.upkeep,
                production: this.cardData.production
            },
            bullets: this.bullets,
            classType: 'card',
            code: this.cardData.code,
            cost: this.cardData.cost,
            controlled: this.owner !== this.controller,
            effects: effects,
            facedown: this.facedown,
            gamelocation: this.gamelocation,
            influence: this.influence,
            location: this.location,
            menu: this.getMenu(activePlayer),
            new: this.new,
            production: this.production,
            scripted: this.isScripted(),
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

const BaseCard = require('./basecard.js');
const CardMatcher = require('./CardMatcher.js');
const { ShootoutStatuses } = require('./Constants/index.js');
const PhaseNames = require('./Constants/PhaseNames.js');
const PlayingTypes = require('./Constants/PlayingTypes.js');
const NullCard = require('./nullcard.js');
const StandardActions = require('./PlayActions/StandardActions.js');
const ReferenceConditionalSetProperty = require('./PropertyTypes/ReferenceConditionalSetProperty.js');

const LocationsWithEventHandling = ['play area', 'legend'];

class DrawCard extends BaseCard {
    constructor(owner, cardData) {
        super(owner, cardData);

        this.attachments = [];

        this.booted = false;
        this.minCost = 0;
        this.difficultyMod = 0;
        this.currentControl = this.cardData.control || 0;
        this.currentUpkeep = this.cardData.upkeep;
        this.permanentControl = 0;
        this.permanentUpkeep = 0;
        this.shootoutStatus = ShootoutStatuses.None;
        if(!this.hasKeyword('rowdy')) {
            this.controlDeterminator = 'influence:deed';
        } else {
            this.controlDeterminator = 'bullets';
        }

        if(cardData.starting) {
            this.starting = true;
        }       
        this.attachmentLimits = []; // other than base ones for weapon, horse and attire
        
        this.actionPlacementLocation = 'discard pile';
        this.options = new ReferenceConditionalSetProperty();
    }

    get controller() {
        if(this.parent) {
            this.controller = this.parent.controller;
        }
        return this.controllingPlayer;
    }

    set controller(controller) {
        this.controllingPlayer = controller;
    }

    get gamelocation() {
        let tempLocation = super.gamelocation;

        if(this.getType() === 'goods' || this.getType() === 'spell' || this.getType() === 'action') {
            return this.parent ? this.parent.gamelocation : '';
        }

        return tempLocation;
    }

    set gamelocation(gamelocation) {
        super.gamelocation = gamelocation;
    }

    get difficulty() {
        const finalDifficulty = this.keywords.getDifficulty() + this.difficultyMod;
        return finalDifficulty < 1 ? 1 : finalDifficulty;
    }

    get control() {
        return this.currentControl;
    }

    set control(amount) {
        if(amount < 0) {
            this.currentControl = 0;
        } else {
            this.currentControl = amount;
        }
    }

    get upkeep() {
        if(this.currentUpkeep < 0) {
            return 0;
        }
        return this.currentUpkeep;
    }

    set upkeep(amount) {
        this.currentUpkeep = amount;
    }

    get locationCard() {
        if(this.isNotPlanted()) {
            return new NullCard();
        }
        return super.locationCard;
    }    

    modifyControl(amount, applying = true, fromEffect = false) {
        this.currentControl += amount;
        if(!fromEffect) {
            this.permanentControl += amount;
        }

        let params = {
            card: this,
            amount: amount,
            applying: applying
        };
        this.game.raiseEvent('onCardControlChanged', params);
    }

    modifyUpkeep(amount, applying = true, fromEffect = false) {
        this.currentUpkeep += amount;
        if(!fromEffect) {
            this.permanentUpkeep += amount;
        }

        let params = {
            card: this,
            amount: amount,
            applying: applying
        };
        this.game.raiseEvent('onCardUpkeepChanged', params);
    }

    removeAllControl() {
        this.currentControl -= this.permanentControl;
        this.permanentControl = 0;
        this.game.effectEngine.getAllEffectsOnCard(this, effect => 
            ['increaseControl', 'decreaseControl'].includes(effect.gameAction)).forEach(effect => effect.cancel());
        this.control = 0;
    }

    createSnapshot(clone, cloneBaseAttributes = true) {
        if(!clone) {
            clone = new DrawCard(this.owner, this.cardData);
        }
        clone = super.createSnapshot(clone, cloneBaseAttributes);
        clone.attachments = this.attachments.map(attachment => attachment.createSnapshot());
        clone.booted = this.booted;
        clone.parent = this.parent;
        clone.options = this.options;
        clone.shootoutStatus = this.shootoutStatus;

        return clone;
    }

    getMenu(player) {
        let menu = super.getMenu(player);
        if(!menu) {
            menu = [];
        }
        let discardItem = { method: 'discard', text: 'Discard' };

        switch(this.location) {
            case 'draw hand':
                return menu.concat(discardItem);
            case 'hand':
                if(this.getType() === 'action') {
                    return menu.concat(discardItem);
                }
                if(this.game.currentPhase === PhaseNames.HighNoon) {
                    menu = menu.concat({ method: 'playCard', text: 'Shoppin\' play', arg: 'shoppin' });
                }
                if(this.abilities.playActions.length > 0) {
                    let isEnabled = this.abilities.playActions.some(playAction => playAction.meetsRequirements(playAction.createContext(player)));
                    menu = menu.concat({ method: 'playCard', text: 'Play action', arg: 'play', disabled: !isEnabled });
                }
                return menu.concat(discardItem);
            default:
                return menu;
        }
    }

    discard(player) {
        player.discardCard(this);
    }

    playCard(player, arg) {
        player.playCard(this, arg);
    }

    hasPrintedCost() {
        return !this.facedown && this.cardData.cost !== '-';
    }

    getPrintedCost() {
        return this.getPrintedNumberFor(this.cardData.cost);
    }

    getCost() {
        return this.getPrintedCost();
    }

    getMinCost() {
        return this.minCost;
    }
    
    moveTo(targetLocation, raiseEvents = true, parent) {
        let originalLocation = this.location;
        let originalParent = this.parent;

        if(originalParent && originalParent !== parent) {
            originalParent.removeAttachment(this);
        }

        if(originalLocation !== targetLocation) {
            // Clear any tokens on the card unless it is transitioning position
            // within the same area e.g. moving an attachment from one card
            // to another, or a card transferring control between players.
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

        if((originalLocation !== targetLocation || originalParent !== parent) && raiseEvents) {
            this.game.raiseEvent('onCardMoved', { card: this, originalLocation: originalLocation, newLocation: targetLocation, parentChanged: originalParent !== parent });
        }
    }

    /**
     * Defines restrictions on what cards this attachment can be placed on.
     */
    attachmentRestriction(...restrictions) {
        this.attachmentRestrictions = restrictions.map(restriction => {
            if(typeof(restriction) === 'function') {
                return restriction;
            }

            return CardMatcher.createAttachmentMatcher(restriction);
        });
    }

    /**
     * Applies an effect with the specified properties while the current card is
     * attached to another card. By default the effect will target the parent
     * card, but you can provide a match function to narrow down whether the
     * effect is applied (for cases where the effect only applies to specific
     * cards).
     */
    whileAttached(properties) {
        this.persistentEffect({
            condition: () => !!this.parent && (!this.isTotem() || !this.isNotPlanted()) && (!properties.condition || properties.condition()),
            match: (card, context) => {
                if(this.isTotem()) {
                    if(card.uuid !== this.gamelocation) {
                        return false;
                    }
                } else if(card.uuid !== this.parent.uuid) {
                    return false;
                }
                return !properties.match || properties.match(card, context);
            },
            targetController: 'any',
            effect: properties.effect,
            recalculateWhen: properties.recalculateWhen,
            fromTrait: properties.fromTrait === undefined ? true : properties.fromTrait
        });
    }

    clearBlank(type) {
        super.clearBlank(type);
        this.attachments.forEach(attachment => {
            if(!attachment.canAttach(this.controller, this)) {
                this.controller.discardCard(attachment);
            }
        });
    }

    /**
     * Checks whether the passed card meets the attachment restrictions (e.g.
     * Opponent cards only, etc) for this card.
     */
    canAttach(player, card, playingType) {
        if(!card || card.cannotAttachCards(this)) {
            return false;
        }

        if(this.getType() !== 'goods' && this.getType() !== 'spell' && this.getType() !== 'action') {
            return false;
        }
        if(this.getType() === 'action' && !this.hasKeyword('condition') && !this.hasKeyword('technique')) {
            return false;
        }
        if(card.getType() !== 'dude' && card.getType() !== 'outfit' && card.getType() !== 'deed') {
            return false;
        }

        // Do not check attachment restrictions if this is Improvement goods type. That is because the
        // restriction is checked only at the time it is being attached.
        if(this.isImprovement() && playingType === PlayingTypes.ValidityCheck) {
            return true;
        }
        
        let context = { player: player };

        return !this.attachmentRestrictions || (this.isTotem() && card.canAttachTotems(this)) ||
            this.attachmentRestrictions.some(restriction => restriction(card, context));
    }

    hasAttachmentForTrading(condition = () => true) {
        return this.hasAttachment(condition, true);
    }

    hasAttachment(condition = () => true, forTrading = false) {
        if(this.attachments.length === 0) {
            return false;
        }
        let attsFitCondition = this.attachments.filter(attachment => condition(attachment));
        if(attsFitCondition.length === 0) {
            return false;
        }
        if(!forTrading) {
            return true;
        }

        let tradingAttachments = attsFitCondition.filter(attachment => attachment.getType() === 'goods' && !attachment.wasTraded() && !attachment.cannotBeTraded());
        return tradingAttachments.length > 0;
    }
    
    getAttachmentsByKeywords(keywords) {
        if(!this.attachments) {
            return [];
        }
        let searchKeywords = keywords;
        if(!Array.isArray(keywords)) {
            searchKeywords = [keywords];
        }
        return this.attachments.filter(attachment => {
            for(let keyword of searchKeywords) {
                if(!attachment.hasKeyword(keyword)) {
                    return false;
                }
            }
            return true;
        });
    }

    hasAttachmentWithKeywords(keywords) {
        return this.getAttachmentsByKeywords(keywords).length > 0;
    }

    removeAttachment(attachment) {
        if(!attachment || !this.attachments.includes(attachment)) {
            return;
        }

        this.attachments = this.attachments.filter(a => a !== attachment);
        attachment.parent = undefined;
    }

    addAttachmentLimit(limitToAdd) {
        const existingLimit = this.attachmentLimits.find(attLimit => attLimit.keyword === limitToAdd.keyword);
        if(!existingLimit) {
            this.attachmentLimits.push(limitToAdd);
        } else {
            existingLimit.limit = limitToAdd.limit;
        }
    }

    removeAttachmentLimit(limitToRemove) {
        this.attachmentLimits = this.attachmentLimits.filter(attLimit => attLimit.keyword !== limitToRemove.keyword);
    }    

    getPlayActions(type) {
        if(type === 'shoppin') {
            return [StandardActions.shoppin(this)];
        }
        return this.abilities.playActions
            .concat(this.abilities.actions.filter(action => !action.allowMenu()));
    }

    hasAbilityForType(abilityType, checkAttached = true) {
        if(this.abilities.actions.some(action => action.playType.includes(abilityType))) {
            return true;
        }
        if(!checkAttached) {
            return false;
        }
        return this.attachments.some(att => att.abilities.actions.some(action => 
            action.playType.includes('shootout') || action.playType.includes('resolution')));
    }

    leavesPlay() {
        this.booted = false;
        if(this.attachments.length) {
            this.owner.discardCards(this.attachments, () => true, { isCardEffect: false });
        }
        if(this.parent) {
            this.parent.removeAttachment(this);
        }
        if(this.getType() === 'deed') {
            this.owner.removeDeedFromPlay(this, dude => dude.sendHome({ needToBoot: true }));
        }
        this.control = this.currentControl - this.permanentControl;
        this.permanentControl = 0;
        this.upkeep = this.currentUpkeep - this.permanentUpkeep;
        this.permanentUpkeep = 0;
        super.leavesPlay();
    }

    isAtHome() {
        if(this.location !== 'play area') {
            return false;
        }
        return this.game.isHome(this.gamelocation, this.controller);
    }

    /**
     * Checks if card is at a deed, or specific type of deed depending on the
     * parameter.
     *
     * @param {Object} deedType - type of deed that should be checked.\
     * `any` (default) - Check if the card is at deed of any type.\
     * `in-town` - check if the card is at in-town deed.\
     * `out-town` - check if the card is at out of town deed.\
     * @return {Boolean} - returns true if card is at specified type of deed, 
     * false otherwise.
     */
    isAtDeed(deedType = 'any') {
        if(this.location !== 'play area') {
            return false;
        }
        const thisLocationCard = this.locationCard;
        if(!thisLocationCard || thisLocationCard.getType() !== 'deed') {
            return false;
        }
        if(deedType === 'in-town') {
            return !thisLocationCard.isOutOfTown();
        }
        if(deedType === 'out-town') {
            return thisLocationCard.isOutOfTown();
        }
        return true;     
    }  

    isGadget() {
        return this.hasKeyword('Gadget');
    }

    isImprovement() {
        return this.hasKeyword('Improvement');
    }

    isOutOfTown() {
        return this.hasKeyword('Out of Town');
    }

    doesNotReturnAfterJob() {
        return this.options.contains('doesNotReturnAfterJob');
    }

    doesNotProvideBulletRatings() {
        return this.options.contains('doesNotProvideBulletRatings');
    }

    doesNotHaveToBeInvented() {
        return this.options.contains('doesNotHaveToBeInvented');
    }

    isSelectedAsFirstCasualty() {
        return this.options.contains('isSelectedAsFirstCasualty', this);
    }

    isNotPlanted() {
        return this.options.contains('isNotPlanted', this);
    }    

    calloutCannotBeRefused(opponentDude) {
        return this.options.contains('calloutCannotBeRefused', opponentDude);
    }

    cannotRefuseCallout(opponentDude) {
        return this.options.contains('cannotRefuseCallout', opponentDude);
    }

    cannotBePickedAsShooter() {
        return this.options.contains('cannotBePickedAsShooter', this);
    }

    cannotInventGadgets() {
        return this.options.contains('cannotInventGadgets', this);
    }

    cannotBeChosenAsCasualty() {
        return this.options.contains('cannotBeChosenAsCasualty', this);
    }

    cannotBeTraded() {
        return this.options.contains('cannotBeTraded', this);
    }

    cannotFlee() {
        return this.options.contains('cannotFlee');
    }

    cannotJoinPosse(posse) {
        return this.options.contains('cannotJoinPosse', posse);
    }
    
    cannotMakeCallout(targetDude) {
        return this.options.contains('cannotMakeCallout', targetDude);
    }    

    cannotAttachCards(attachment) {
        return this.options.contains('cannotAttachCards', attachment);
    }

    canRefuseWithoutGoingHomeBooted() {
        return this.options.contains('canRefuseWithoutGoingHomeBooted');
    }

    canUseControllerAbilities(player) {
        return this.options.contains('canUseControllerAbilities', player);
    }

    canBeInventedWithoutBooting() {
        return this.options.contains('canBeInventedWithoutBooting');
    }
    
    canAttachTotems(totem) {
        return this.options.contains('canAttachTotems', totem);
    }

    canBeAced(context) {
        return this.allowGameAction('ace', context);
    }

    canBeDiscarded(context) {
        return this.allowGameAction('discard', context);
    }

    canBeBooted(context) {
        return this.allowGameAction('boot', context);
    }

    canBeUnbooted(context) {
        return this.allowGameAction('unboot', context);
    }

    canBeCalledOut(context) {
        return this.allowGameAction('callout', context);
    }

    getSummary(activePlayer) {
        let baseSummary = super.getSummary(activePlayer);

        let publicSummary = {
            attached: !!this.parent,
            attachments: this.attachments.map(attachment => {
                return attachment.getSummary(activePlayer);
            }),
            booted: this.booted,
            control: this.control,
            shootoutStatus: this.shootoutStatus
        };

        if(baseSummary.facedown) {
            return Object.assign(baseSummary, publicSummary);
        }

        return Object.assign(baseSummary, publicSummary, {});
    }
}

module.exports = DrawCard;

const _ = require('underscore');
const BaseCard = require('./basecard.js');
const CardMatcher = require('./CardMatcher.js');
const StandardActions = require('./PlayActions/StandardActions.js');
const ReferenceCountedSetProperty = require('./PropertyTypes/ReferenceCountedSetProperty.js');

const LocationsWithEventHandling = ['play area', 'legend'];

class DrawCard extends BaseCard {
    constructor(owner, cardData) {
        super(owner, cardData);

        this.attachments = _([]);

        this.booted = false;
        this.minCost = 0;
        this.currentControl = this.cardData.control;

        if(cardData.starting) {
            this.starting = true;
        }       
        
        this.actionPlacementLocation = 'discard pile';
        this.shootoutOptions = new ReferenceCountedSetProperty();
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

    modifyControl(amount, applying = true) {
        this.currentControl += amount;

        let params = {
            card: this,
            amount: amount,
            applying: applying
        };
        this.game.raiseEvent('onCardControlChanged', params);
    }

    createSnapshot(clone, cloneBaseAttributes = true) {
        if(!clone) {
            clone = new DrawCard(this.owner, this.cardData);
        }
        clone = super.createSnapshot(clone, cloneBaseAttributes);
        clone.attachments = this.attachments.map(attachment => attachment.createSnapshot());
        clone.booted = this.booted;
        clone.parent = this.parent;
        clone.shootoutOptions = this.shootoutOptions;

        return clone;
    }

    getMenu(player) {
        let menu = super.getMenu(player);
        if(!menu) {
            menu = [];
        }
        let discardItem = { method: 'discard', text: 'Discard' };
        let playItem = { method: 'playCard', text: 'Shoppin\' play' };

        switch(this.location) {
            case 'draw hand':
                return menu.concat(discardItem);
            case 'hand':
                if(this.getType() === 'action') {
                    return menu.concat(discardItem);
                }
                return menu.concat(discardItem).concat(playItem);
            default:
                return menu;
        }
    }

    discard(player) {
        player.discardCard(this);
    }

    playCard(player) {
        player.playCard(this);
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

    getInfluence() {
        return this.influence || 0;
    }  

    getControl() {
        return this.control || 0;
    }
    
    moveTo(targetLocation, parent) {
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

        if(originalLocation !== targetLocation || originalParent !== parent) {
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
            condition: () => !!this.parent && (!properties.condition || properties.condition()),
            match: (card, context) => card === this.parent && (!properties.match || properties.match(card, context)),
            targetController: 'any',
            effect: properties.effect,
            recalculateWhen: properties.recalculateWhen
        });
    }

    clearBlank() {
        super.clearBlank();
        this.attachments.each(attachment => {
            if(!this.canAttach(this.controller, attachment)) {
                this.controller.discardCard(attachment, false);
            }
        });
    }

    /**
     * Checks whether the passed card meets the attachment restrictions (e.g.
     * Opponent cards only, etc) for this card.
     */
    canAttach(player, card) {
        if(!card) {
            return false;
        }

        if((this.getType() !== 'goods') && (this.getType() !== 'spell')) {
            return false;
        }
        if(card.getType() !== 'dude' && card.getType() !== 'outfit' && card.getType() !== 'deed') {
            return false;
        }    
        return true;
    }

    hasAttachmentForTrading(condition = () => true) {
        return this.hasAttachment(condition, true);
    }

    hasAttachment(condition = () => true, forTrading = false) {
        if(this.attachments.isEmpty()) {
            return false;
        }
        let attsFitCondition = this.attachments.filter(attachment => condition(attachment));
        if(attsFitCondition.length === 0) {
            return false;
        }
        if(!forTrading) {
            return true;
        }

        let tradingAttachments = attsFitCondition.filter(attachment => attachment.getType() === 'goods' && !attachment.wasTraded());
        return tradingAttachments.length > 0;
    }
    
    getAttachmentsByKeywords(keywords) {
        return this.attachments.filter(attachment => {
            for(let keyword of keywords) {
                if(!attachment.hasKeyword(keyword)) {
                    return false;
                }
            }
            return true;
        });
    }

    removeAttachment(attachment) {
        if(!attachment || !this.attachments.includes(attachment)) {
            return;
        }

        this.attachments = _(this.attachments.reject(a => a === attachment));
        attachment.parent = undefined;
    }

    getPlayActions() {
        return [StandardActions.shoppin()]
            .concat(this.abilities.playActions)
            .concat(this.abilities.actions.filter(action => !action.allowMenu()));
    }

    leavesPlay() {
        this.booted = false;
        this.control = 0;
        this.attachments.each(attachment => {
            attachment.controller.moveCard(attachment, 'discard pile', { raiseEvents: false });
        });
        if(this.parent) {
            this.parent.removeAttachment(this);
        }
        super.leavesPlay();
    }

    canBeAced() {
        return this.allowGameAction('ace');
    }

    canBeDiscarded() {
        return this.allowGameAction('discard');
    }

    canBeBooted() {
        return this.allowGameAction('boot');
    }

    canBeUnbooted() {
        return this.allowGameAction('unboot');
    }

    canBeCalledOut() {
        return this.allowGameAction('callout');
    }

    getSummary(activePlayer) {
        let baseSummary = super.getSummary(activePlayer);

        let publicSummary = {
            attached: !!this.parent,
            attachments: this.attachments.map(attachment => {
                return attachment.getSummary(activePlayer);
            }),
            booted: this.booted,
            control: this.control
        };

        if(baseSummary.facedown) {
            return Object.assign(baseSummary, publicSummary);
        }

        return Object.assign(baseSummary, publicSummary, {});
    }
}

module.exports = DrawCard;

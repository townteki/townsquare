const _ = require('underscore');
const BaseCard = require('./basecard.js');
const CardMatcher = require('./CardMatcher.js');
const ReferenceCountedSetProperty = require('./PropertyTypes/ReferenceCountedSetProperty');
const StandardPlayActions = require('./PlayActions/StandardActions');

this.icons = {
    bullets: 0,
    influence: 0,
    control: 0
}

class DrawCard extends BaseCard {
    constructor(owner, cardData) {
        super(owner, cardData);

        this.attachments = _([]);
        this.icons = {
            bullet: 0,
            influence: 0,
            control: 0
        };

        this.booted = false;
        this.minCost = 0;

        if(cardData.starting) {
            this.starting = true;
        }

        if(cardData.bullets) {
            this.icons.bullets = cardData.bullets;
        }  
        if(cardData.influence) {
            this.icons.influence = cardData.influence;
        }  
        if(cardData.control) {
            this.icons.control = cardData.control;
        }                        
    }

    createSnapshot() {
        let clone = new DrawCard(this.owner, this.cardData);

        clone.attachments = this.attachments.map(attachment => attachment.createSnapshot());
        clone.booted = this.booted;
        clone.bullets = this.bullets;
        clone.control = this.control;
        clone.gamelocation = this.gamelocation;
        clone.influence = this.influence;
        clone.production = this.production;
        clone.shooter = this.shooter;
        clone.upkeep = this.upkeep;
        clone.value = this.value;
        clone.location = this.location;
        clone.keywords = this.keywords;
        clone.parent = this.parent;
        clone.tokens = Object.assign({}, this.tokens);

        return clone;
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

    modifyControl(control) {
        this.game.applyGameAction('gainControl', this, card => {
            let oldControl = card.control;

            card.control += control;

            if(card.control < 0) {
                card.control = 0;
            }

            this.game.raiseEvent('onCardControlChanged', this, card.control - oldControl);

            this.game.checkWinCondition(this.controller);
        });
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

    clearBlank() {
        super.clearBlank();
        this.attachments.each(attachment => {
            if(!this.allowAttachment(attachment)) {
                this.controller.discardCard(attachment, false);
            }
        });
    }

    /**
     * Checks 'no attachment' restrictions for this card when attempting to
     * attach the passed attachment card.
     */
    allowAttachment(attachment) {
        return (
            this.isBlank() ||
            this.allowedAttachmentTrait === 'any' ||
            this.allowedAttachmentTrait !== 'none' && attachment.hasTrait(this.allowedAttachmentTrait)
        );
    }

    /**
     * Checks whether the passed card meets the attachment restrictions (e.g.
     * Opponent cards only, specific factions, etc) for this card.
     */
    canAttach(player, card) {
        return card && this.getType() === 'attachment';
    }

    removeAttachment(attachment) {
        if(!attachment || !this.attachments.includes(attachment)) {
            return;
        }

        this.attachments = _(this.attachments.reject(a => a === attachment));
        attachment.parent = undefined;
    }

    addChildCard(card, location) {
        this.childCards.push(card);
        card.moveTo(location, this);
    }

    removeChildCard(card) {
        if(!card) {
            return;
        }

        this.attachments = this.attachments.filter(a => a !== card);
        this.dupes = this.dupes.filter(a => a !== card);
        this.childCards = this.childCards.filter(a => a !== card);
    }

    getPlayActions() {
        return StandardPlayActions
            .concat(this.abilities.playActions)
            .concat(this.abilities.actions.filter(action => !action.allowMenu()));
    }

    leavesPlay() {
        this.booted = false;
        this.control = 0;

        super.leavesPlay();
    }

    canBeDiscarded() {
        return this.allowGameAction('discard');
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
        };

        if(baseSummary.facedown) {
            return Object.assign(baseSummary, publicSummary);
        }

        return Object.assign(baseSummary, publicSummary, {});
    }
}

module.exports = DrawCard;

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
        this.currentControl = this.cardData.control;

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
        
        this.actionPlacementLocation = 'discard pile';
        this.shootoutOptions = new ReferenceCountedSetProperty();
    }

    get control() {
        return this.currentControl;
    }

    set control(amount) {
        if (amount < 0) {
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

    createSnapshot(clone) {
        if (!clone) {
            clone = new DrawCard(this.owner, this.cardData);
        }

        clone.attachments = this.attachments.map(attachment => attachment.createSnapshot());
        clone.booted = this.booted;
        clone.bullets = this.bullets;
        clone.control = this.control;
        clone.gamelocation = this.gamelocation;
        clone.influence = this.influence;
        clone.production = this.production;
        clone.upkeep = this.upkeep;
        clone.value = this.value;
        clone.location = this.location;
        clone.keywords = this.keywords;
        clone.parent = this.parent;
        clone.tokens = Object.assign({}, this.tokens);

        return clone;
    }

    getMenu(player) {
        let menu = super.getMenu(player);
        if(!menu) {
            menu = [];
        }
        let discardItem = { method: 'discard', text: 'Discard' };
        let playItem = { method: 'playCard', text: 'Play' };

        switch (this.location) {
            case 'draw hand':
                return menu.concat(discardItem);
            case 'hand':
                if (this.getType() === 'action') {
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

    modifyControl(control) {
        this.game.applyGameAction('gainControl', this, card => {
            let oldControl = card.control;

            card.control += control;

            if(card.control < 0) {
                card.control = 0;
            }

            this.game.raiseEvent('onCardControlChanged', { card: this, changedAmount: card.control - oldControl });

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
            if(!this.canAttach(this.controller, attachment)) {
                this.controller.discardCard(attachment, false);
            }
        });
    }

    /**
     * Checks whether the passed card meets the attachment restrictions (e.g.
     * Opponent cards only, specific factions, etc) for this card.
     */
    canAttach(player, card) {
        if (!card) {
            return false;
        }

        if ((this.getType() !== 'goods') && (this.getType() !== 'spell')) {
            return false;
        }
        if (card.getType() !== 'dude' && card.getType() !== 'outfit' && card.getType() !== 'deed') {
            return false;
        }    
        return true;
    }

    hasAttachmentForTrading(condition = () => true) {
        return this.hasAttachment(condition, true);
    }

    hasAttachment(condition = () => true, forTrading = false) {
        if (this.attachments.isEmpty()) {
            return false;
        }
        let attsFitCondition = this.attachments.filter(attachment => condition(attachment));
        if (attsFitCondition.length == 0) {
            return false;
        }
        if (!forTrading) {
            return true;
        }

        let tradingAttachments = attsFitCondition.filter(attachment => attachment.getType() === 'goods' && !attachment.wasTraded());
        return tradingAttachments.length > 0;
    }
    
    getAttachmentsByKeywords(keywords) {
        return this.attachments.filter(attachment => {
            for (let keyword of keywords) {
                if (!attachment.hasKeyword(keyword)) {
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
            control: this.control
        };

        if(baseSummary.facedown) {
            return Object.assign(baseSummary, publicSummary);
        }

        return Object.assign(baseSummary, publicSummary, {});
    }
}

module.exports = DrawCard;

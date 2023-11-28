class AttachmentValidityCheck {
    constructor(game) {
        this.game = game;
        this.beingDiscarded = [];
    }

    enforceValidity() {
        let invalidAttachments = this.filterInvalidAttachments();
        let needsDiscard = invalidAttachments.filter(attachment => !this.beingDiscarded.includes(attachment));

        if(needsDiscard.length > 0) {
            this.beingDiscarded = this.beingDiscarded.concat(needsDiscard);

            this.game.queueSimpleStep(() => {
                for(let [owner, cards] of this.groupAttachmentsByOwner(needsDiscard)) {
                    owner.discardCards(cards, discarded => {
                        this.game.addMessage('{0} is forced to discard {1} due to being invalidly attached', owner, discarded);
                    });
                }
            });
            this.game.queueSimpleStep(() => {
                this.beingDiscarded = this.beingDiscarded.filter(attachment => !needsDiscard.includes(attachment));
            });
        }

        this.game.queueSimpleStep(() => {
            const allParents = this.game.filterCardsInPlay(card => card.getType() === 'dude' && card.hasAttachment() && !card.facedown);
            for(let parent of allParents) {
                const weaponLimit = parent.checkWeaponLimit();
                if(weaponLimit) {
                    this.discardByType(parent.controller, 'weapon', weaponLimit);
                }
                const horseLimit = parent.checkHorseLimit();
                if(horseLimit) {
                    this.discardByType(parent.controller, 'horse', horseLimit);
                }
                const attireLimit = parent.checkAttireLimit();
                if(attireLimit) {
                    this.discardByType(parent.controller, 'attire', attireLimit);
                }
                for(let attLimit of parent.attachmentLimits) {
                    const limitedAttachments = parent.getAttachmentsByKeywords([attLimit.keyword]);
                    if(limitedAttachments.length > attLimit.limit) {
                        this.discardByType(parent.controller, attLimit.keyword, { limit: attLimit.limit, cards: limitedAttachments });
                    }
                }
            }
        });
    }

    discardByType(player, attType, limitObject) {
        this.game.promptForSelect(player, {
            activePromptTitle: `Select ${attType}(s) to discard down to limit ${limitObject.limit}`,
            waitingPromptTitle: `Waiting for opponent to discard ${attType}(s) over limit`,
            cardCondition: card => limitObject.cards.includes(card),
            multiSelect: true,
            numCards: limitObject.cards.length - limitObject.limit,
            onSelect: (player, cards) => {
                player.discardCards(cards, () => 
                    this.game.addMessage('{0} discards over the limit {1}(s): {2}', player, attType, cards)
                );
                return true;
            },
            onCancel: (player) => this.game.addAlert('danger', '{0} does not discard attachments with keyword {1} over the limit {2}', 
                player, attType, limitObject.limit)
        });
    }

    filterInvalidAttachments() {
        const allAttachments = this.game.filterCardsInPlay(card => 
            card.parent && ['goods', 'spell', 'action'].includes(card.getType()) && !card.isBeingRemoved && !card.facedown);
        if(!allAttachments || allAttachments.length === 0) {
            return [];
        }
        return allAttachments.filter(card => !card.controller.canAttach(card, card.parent, 'validityCheck'));
    }

    groupAttachmentsByOwner(cards) {
        return cards.reduce((map, card) => {
            let cardsForOwner = map.get(card.owner) || [];
            map.set(card.owner, cardsForOwner.concat([card]));
            return map;
        }, new Map());
    }
}

module.exports = AttachmentValidityCheck;

const PlayingTypes = require('../../Constants/PlayingTypes.js');
const UiPrompt = require('../uiprompt.js');

class TradingPrompt extends UiPrompt {
    constructor(game, player, attachments) {
        super(game);
        this.player = player;
        if(Array.isArray(attachments)) {
            this.attachments = attachments;
        } else {
            this.attachments = [attachments];
        }
        this.fromDudeCard = this.attachments[0].parent;
        this.tradingLocationUuid = this.fromDudeCard.gamelocation;
        this.tradingDone = false;
        this.isFirstTrading = true;
    }

    activeCondition() {
        return !this.tradingDone;
    }

    isComplete() {
        return this.tradingDone;
    }

    continue() {
        if(!this.tradingDone) {
            if(this.isFirstTrading) {
                this.performTrading(this.fromDudeCard);
                this.isFirstTrading = false;
            } else {
                this.selectFromDude();
            }
        }
        return super.continue();
    }

    performTrading() {
        this.game.promptForSelect(this.player, {
            promptTitle: 'Tradin\' action',
            activePromptTitle: 'Select dude to receive goods',
            cardCondition: card => card.controller.equals(this.player) && 
                card.getType() === 'dude' &&
                !card.booted &&
                card.gamelocation === this.fromDudeCard.gamelocation && 
                card !== this.fromDudeCard,
            onSelect: (player, toDudeCard) => {
                let targetPlayer = toDudeCard.controller;
                if(toDudeCard.hasAttachmentForTrading()) {
                    this.game.promptForSelect(targetPlayer, {
                        promptTitle: 'Tradin\' action',
                        activePromptTitle: 'Select attachment(s) for swapping',
                        multiSelect: true,
                        numCards: 0,
                        cardCondition: swapCard => swapCard.getType() === 'goods' && 
                            swapCard.parent === toDudeCard &&
                            !swapCard.wasTraded() &&
                            !swapCard.cannotBeTraded(),
                        onSelect: (tradingPlayer, swapCards) => {
                            swapCards.forEach(swapCard => toDudeCard.removeAttachment(swapCard));
                            this.attachAttachments(this.attachments, this.fromDudeCard, toDudeCard, 'traded');
                            this.attachAttachments(swapCards, toDudeCard, this.fromDudeCard, 'swapped back');
                            return true;
                        },
                        onCancel: () => {
                            this.attachAttachments(this.attachments, this.fromDudeCard, toDudeCard, 'traded');
                        }
                    });
                } else {
                    this.attachAttachments(this.attachments, this.fromDudeCard, toDudeCard, 'traded');
                }                              
                return true;
            }
        });
    }

    selectFromDude() {
        this.game.promptForSelect(this.player, {
            promptTitle: 'Tradin\' action',
            activePromptTitle: 'Select another dude to trade goods from',
            waitingPromptTitle: 'Waiting for opponent to select dude',
            cardCondition: card => card.location === 'play area' &&
                card.hasAttachmentForTrading() &&
                this.tradingLocationUuid === card.gamelocation,
            cardType: 'dude',
            onSelect: (player, dude) => {
                this.fromDudeCard = dude;
                this.game.promptForSelect(player, {
                    activePromptTitle: 'Select attachment(s) to trade',
                    multiSelect: true,
                    numCards: 0,
                    cardCondition: card => card.controller.equals(player) && dude.canTradeGoods(card),
                    onSelect: (player, cards) => {
                        this.attachments = cards;
                        this.performTrading();
                        return true;
                    }
                });                
                return true;
            },
            onCancel: () => {
                this.tradingDone = true;
            }
        });
    }

    attachAttachments(attachments, fromDude, toDude, actionWord) {
        attachments.forEach(fromAttachment => {
            if(this.player.attach(fromAttachment, toDude, PlayingTypes.Trading)) {
                this.game.addMessage('{0} {1} {2} from {3} to {4}', this.player, actionWord, fromAttachment, fromDude, toDude);
            }
        });
    }
}

module.exports = TradingPrompt;

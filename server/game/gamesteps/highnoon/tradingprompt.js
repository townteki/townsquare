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
    }

    continue() {
        this.game.promptForSelect(this.player, {
            activePromptTitle: 'Select dude for trading',
            cardCondition: card => card.gamelocation === this.fromDudeCard.gamelocation && card !== this.fromDudeCard,
            onSelect: (player, toDudeCard) => {
                let targetPlayer = toDudeCard.controller;
                if(toDudeCard.hasAttachmentForTrading()) {
                    this.game.promptForSelect(targetPlayer, {
                        activePromptTitle: 'Select attachment(s) for swapping',
                        multiSelect: true,
                        numCards: 0,
                        cardCondition: swapCard => swapCard.getType() === 'goods' && 
                            swapCard.parent === toDudeCard &&
                            !swapCard.wasTraded(),
                        onSelect: (tradingPlayer, swapCards) => {
                            swapCards.forEach(swapCard => toDudeCard.removeAttachment(swapCard));
                            this.attachAttachments(this.attachments, this.fromDudeCard, toDudeCard, 'traded');
                            this.attachAttachments(swapCards, toDudeCard, this.fromDudeCard, 'swapped back');
                            return true;
                        }
                    });
                } else {
                    this.attachAttachments(this.attachments, this.fromDudeCard, toDudeCard, 'traded');
                }                              
                return true;
            }
        });
        return true;
    }

    attachAttachments(attachments, fromDude, toDude, actionWord) {
        attachments.forEach(fromAttachment => {
            if(this.player.attach(fromAttachment, toDude, 'trading')) {
                this.game.addMessage('{0} {1} {2} from {3} to {4}', this.player, actionWord, fromAttachment, fromDude, toDude);
            }
        });
    }
}

module.exports = TradingPrompt;

const UiPrompt = require('./uiprompt.js');

class AttachmentPrompt extends UiPrompt {
    constructor(game, player, attachmentCard, playingType, targetLocation = '', extraCondition = () => true) {
        super(game);
        this.player = player;
        this.attachmentCard = attachmentCard;
        this.playingType = playingType;
        this.targetLocation = targetLocation;
        this.extraCondition = extraCondition;
    }

    continue() {
        this.game.promptForSelect(this.player, {
            activePromptTitle: 'Select target for attachment',
            cardCondition: card => this.player.canAttach(this.attachmentCard, card, this.playingType) &&
                (this.targetLocation === '' || this.targetLocation === card.gamelocation) &&
                this.extraCondition(this.player, this.attachmentCard, card),
            onSelect: (player, card) => {
                let targetPlayer = card.controller;
                targetPlayer.attach(player, this.attachmentCard, card, this.playingType);
                return true;
            }
        });
    }

}

module.exports = AttachmentPrompt;

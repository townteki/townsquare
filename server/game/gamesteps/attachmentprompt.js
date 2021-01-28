const UiPrompt = require('./uiprompt.js');

class AttachmentPrompt extends UiPrompt {
    constructor(game, player, attachmentCard, params = {}, onAttachCompleted = () => true) {
        super(game);
        this.player = player;
        this.attachmentCard = attachmentCard;
        this.params = params;
        this.playingType = params.playingType || 'play';
        this.targetLocation = params.target || '';
        this.context = params.context || {};
        this.onAttachCompleted = onAttachCompleted;
    }

    continue() {
        this.game.promptForSelect(this.player, {
            activePromptTitle: 'Select target for attachment',
            cardCondition: card => this.player.canAttach(this.attachmentCard, card, this.playingType) &&
                (this.targetLocation === '' || this.targetLocation === card.gamelocation),
            onSelect: (player, card) => {
                player.attach(this.attachmentCard, card, this.playingType);
                if (this.playingType === 'shoppin') {
                    this.game.addMessage('{0} does Shoppin\' to attach {1} to {2}, costing {3} GR', this.player, this.attachmentCard, card, this.context.costs.ghostrock);
                } else {
                    this.game.addMessage('{0} brings into play {1} attaching it to {2}', this.player, this.attachmentCard, card);
                }
                this.onAttachCompleted(this.attachmentCard, this.params);
                return true;
            },
            onCancel: (player,card) => {
                // TODO M2 implement unpaying of costs in case this is cancelled
            }
        });
    }

}

module.exports = AttachmentPrompt;

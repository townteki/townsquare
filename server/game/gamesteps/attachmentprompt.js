const PlayingTypes = require('../Constants/PlayingTypes.js');
const UiPrompt = require('./uiprompt.js');

class AttachmentPrompt extends UiPrompt {
    constructor(game, player, attachmentCard, params = {}, onAttachCompleted = () => true) {
        super(game);
        this.player = player;
        this.attachmentCard = attachmentCard;
        this.params = params;
        this.playingType = params.playingType || PlayingTypes.Play;
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
                player.attach(this.attachmentCard, card, this.playingType, (attachment, target) => 
                    this.onAttachCompleted(attachment, target, this.params), this.params.scientist);
                return true;
            },
            onCancel: () => {
                if(this.context.ability) {
                    this.context.ability.unpayCosts(this.context);
                }
            },
            source: this.attachmentCard
        });
    }
}

module.exports = AttachmentPrompt;

const DudeCard = require('../../dudecard.js');

class JonLongstride extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Jon Longstride',
            playType: 'noon',
            //fix target to target jons horse and not everything
            target: {
                activePromptTitle: 'Choose horse',
                // cardCondition: () => this.hasAttachment(attachment => attachment.hasKeyword('Horse')),
                cardCondition: { location: 'play area', condition: card => card.parent === this && card.hasKeyword('Horse') },
                cardType: ['goods']
            },
            message: context =>
            //better msg plz
                this.game.addMessage('{0} uses {1}\'s ability to unboot {1}\'s Horse', context.player, this),
            handler: (context) => {
                console.log(context.target);
                this.controller.unbootCard(context.target);
            }
        });
    }
}

JonLongstride.code = '01029';

module.exports = JonLongstride;
